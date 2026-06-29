import { PDFDocument, degrees } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { execFile } from 'child_process';
import util from 'util';
import { MAX_PAGE_COUNT, PROCESSING_TIMEOUT_MS } from '../config';
import { fileExists } from '../utils/fs';

const execFileAsync = util.promisify(execFile);

// ─── Processing timeout wrapper ───────────────────────────────────────────────
/**
 * Races a promise against a hard timeout.
 * If the PDF operation takes longer than PROCESSING_TIMEOUT_MS it rejects.
 */
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () =>
        reject(
          new Error(
            `Processing timeout: operation exceeded the ${PROCESSING_TIMEOUT_MS / 1000}s limit.`
          )
        ),
      PROCESSING_TIMEOUT_MS
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

// ─── Safe PDF loader ──────────────────────────────────────────────────────────
async function loadPdf(fileBytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(fileBytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
  } catch {
    throw new Error(
      'The uploaded file is not a valid PDF or is corrupted. Please check the file and try again.'
    );
  }
}

// ─── Page count guard ─────────────────────────────────────────────────────────
function assertPageLimit(doc: PDFDocument, filename: string): void {
  const count = doc.getPageCount();
  if (count > MAX_PAGE_COUNT) {
    throw new Error(
      `"${filename}" has ${count} pages, which exceeds the ${MAX_PAGE_COUNT}-page limit. ` +
        `Please split the file before uploading.`
    );
  }
}

// Removed local fileExists in favor of shared util
// ─── PdfService ───────────────────────────────────────────────────────────────
export class PdfService {
  /**
   * Merges multiple PDF files in the specified order.
   * File reads are parallelized for better I/O throughput.
   */
  static mergePDFs(filePaths: string[], outputFilePath: string): Promise<void> {
    return withTimeout(
      (async () => {
        // Read all files from disk in parallel (I/O bound)
        const readResults = await Promise.all(
          filePaths.map(async (filePath) => {
            if (!(await fileExists(filePath))) {
              throw new Error(`File not found: ${path.basename(filePath)}`);
            }
            const bytes = await fs.readFile(filePath);
            return { filePath, bytes };
          })
        );

        // Process sequentially (CPU bound — pages must be added in order)
        const mergedDoc = await PDFDocument.create();

        for (const { filePath, bytes } of readResults) {
          const doc = await loadPdf(bytes);
          assertPageLimit(doc, path.basename(filePath));

          const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach((page) => mergedDoc.addPage(page));

          if (mergedDoc.getPageCount() > MAX_PAGE_COUNT) {
            throw new Error(
              `The merged document would exceed the ${MAX_PAGE_COUNT}-page limit.`
            );
          }
        }

        const mergedBytes = await mergedDoc.save();
        await fs.writeFile(outputFilePath, mergedBytes);
      })()
    );
  }

  /**
   * Splits a PDF file based on custom page ranges or splits every page.
   */
  static splitPDF(
    filePath: string,
    mode: 'all' | 'ranges',
    rangesInput: { start: number; end: number }[],
    outputDir: string
  ): Promise<{ path: string; filename: string; isZip: boolean }> {
    return withTimeout(
      (async () => {
        if (!(await fileExists(filePath))) {
          throw new Error('File not found');
        }

        const fileBytes = await fs.readFile(filePath);
        const srcDoc = await loadPdf(fileBytes);
        assertPageLimit(srcDoc, path.basename(filePath));

        const totalPages = srcDoc.getPageCount();
        const zip = new JSZip();
        let createdFilesCount = 0;
        let singleOutputFilePath = '';

        if (mode === 'all') {
          // Process all pages — parallelize individual page extraction
          const pagePromises = Array.from({ length: totalPages }, async (_, i) => {
            const newDoc = await PDFDocument.create();
            const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
            newDoc.addPage(copiedPage);
            return { index: i, bytes: await newDoc.save() };
          });

          const pages = await Promise.all(pagePromises);
          for (const { index, bytes } of pages) {
            zip.file(`page_${index + 1}.pdf`, bytes);
            createdFilesCount++;
          }
        } else {
          for (const range of rangesInput) {
            const start = Math.max(1, range.start) - 1;
            const end = Math.min(totalPages, range.end) - 1;
            if (start > end) continue;

            const newDoc = await PDFDocument.create();
            const indices = Array.from(
              { length: end - start + 1 },
              (_, index) => start + index
            );
            const copiedPages = await newDoc.copyPages(srcDoc, indices);
            copiedPages.forEach((page) => newDoc.addPage(page));

            const pdfBytes = await newDoc.save();
            const rangeFileName = `pages_${range.start}-${range.end}.pdf`;

            if (rangesInput.length === 1) {
              singleOutputFilePath = path.join(outputDir, rangeFileName);
              await fs.writeFile(singleOutputFilePath, pdfBytes);
              createdFilesCount = 1;
            } else {
              zip.file(rangeFileName, pdfBytes);
              createdFilesCount++;
            }
          }
        }

        if (createdFilesCount === 0) {
          throw new Error('No pages were selected to split.');
        }

        if (createdFilesCount === 1 && mode === 'ranges') {
          return {
            path: singleOutputFilePath,
            filename: path.basename(singleOutputFilePath),
            isZip: false,
          };
        }

        const zipBytes = await zip.generateAsync({ type: 'nodebuffer' });
        const zipFileName = 'split_result.zip';
        const zipFilePath = path.join(outputDir, zipFileName);
        await fs.writeFile(zipFilePath, zipBytes);

        return { path: zipFilePath, filename: zipFileName, isZip: true };
      })()
    );
  }

  /**
   * Compresses a PDF using pdf-lib's object stream compression.
   * Returns actual before/after file sizes.
   */
  static compressPDF(
    filePath: string,
    level: 'basic' | 'medium' | 'strong',
    outputFilePath: string
  ): Promise<{ originalSize: number; compressedSize: number }> {
    return withTimeout(
      (async () => {
        if (!(await fileExists(filePath))) {
          throw new Error('File not found');
        }

        const [fileBytes, stats] = await Promise.all([
          fs.readFile(filePath),
          fs.stat(filePath),
        ]);
        const originalSize = stats.size;
        const doc = await loadPdf(fileBytes);
        assertPageLimit(doc, path.basename(filePath));

        // Strip metadata that inflates size
        doc.setTitle('');
        doc.setAuthor('');
        doc.setSubject('');
        doc.setKeywords([]);
        doc.setProducer('');
        doc.setCreator('');

        // Ghostscript compression levels mapping
        const gsLevels = {
          basic: '/printer',  // ~300 dpi
          medium: '/ebook',   // ~150 dpi
          strong: '/screen'   // ~72 dpi
        };
        const gsSetting = gsLevels[level] || '/ebook';

        try {
          // Attempt Ghostscript compression (Unix/Linux typically uses 'gs', Windows 'gswin64c' or 'gswin32c')
          // We will try 'gs' first, and catch if it fails.
          const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
          
          await execFileAsync(gsCommand, [
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            `-dPDFSETTINGS=${gsSetting}`,
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            `-sOutputFile=${outputFilePath}`,
            filePath
          ]);
          
        } catch (gsError) {
          console.warn('[Compress] Ghostscript failed or not installed, falling back to pdf-lib.', (gsError as Error).message);
          
          // Fallback to pdf-lib if gs is not available
          const compressedBytes = await doc.save({ useObjectStreams: true });
          await fs.writeFile(outputFilePath, compressedBytes);
        }

        const compressedSize = (await fs.stat(outputFilePath)).size;
        return { originalSize, compressedSize };
      })()
    );
  }

  /**
   * Rotates pages of a PDF.
   */
  static rotatePDF(
    filePath: string,
    rotations: { pageIndex: number; degrees: number }[] | { degrees: number },
    outputFilePath: string
  ): Promise<void> {
    return withTimeout(
      (async () => {
        if (!(await fileExists(filePath))) {
          throw new Error('File not found');
        }

        const fileBytes = await fs.readFile(filePath);
        const doc = await loadPdf(fileBytes);
        assertPageLimit(doc, path.basename(filePath));

        const totalPages = doc.getPageCount();

        if ('degrees' in rotations && !Array.isArray(rotations)) {
          const deg = rotations.degrees;
          for (let i = 0; i < totalPages; i++) {
            const page = doc.getPage(i);
            const current = page.getRotation().angle;
            page.setRotation(degrees(((current + deg) % 360 + 360) % 360));
          }
        } else if (Array.isArray(rotations)) {
          for (const item of rotations) {
            if (item.pageIndex >= 0 && item.pageIndex < totalPages) {
              const page = doc.getPage(item.pageIndex);
              const current = page.getRotation().angle;
              page.setRotation(
                degrees(((current + item.degrees) % 360 + 360) % 360)
              );
            }
          }
        }

        const pdfBytes = await doc.save();
        await fs.writeFile(outputFilePath, pdfBytes);
      })()
    );
  }
}
