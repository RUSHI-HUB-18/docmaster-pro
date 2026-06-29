"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const pdf_lib_1 = require("pdf-lib");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const jszip_1 = __importDefault(require("jszip"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const config_1 = require("../config");
const fs_1 = require("../utils/fs");
const execFileAsync = util_1.default.promisify(child_process_1.execFile);
// ─── Processing timeout wrapper ───────────────────────────────────────────────
/**
 * Races a promise against a hard timeout.
 * If the PDF operation takes longer than PROCESSING_TIMEOUT_MS it rejects.
 */
function withTimeout(promise) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Processing timeout: operation exceeded the ${config_1.PROCESSING_TIMEOUT_MS / 1000}s limit.`)), config_1.PROCESSING_TIMEOUT_MS);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}
// ─── Safe PDF loader ──────────────────────────────────────────────────────────
async function loadPdf(fileBytes) {
    try {
        return await pdf_lib_1.PDFDocument.load(fileBytes, {
            ignoreEncryption: false,
            updateMetadata: false,
        });
    }
    catch {
        throw new Error('The uploaded file is not a valid PDF or is corrupted. Please check the file and try again.');
    }
}
// ─── Page count guard ─────────────────────────────────────────────────────────
function assertPageLimit(doc, filename) {
    const count = doc.getPageCount();
    if (count > config_1.MAX_PAGE_COUNT) {
        throw new Error(`"${filename}" has ${count} pages, which exceeds the ${config_1.MAX_PAGE_COUNT}-page limit. ` +
            `Please split the file before uploading.`);
    }
}
// Removed local fileExists in favor of shared util
// ─── PdfService ───────────────────────────────────────────────────────────────
class PdfService {
    /**
     * Merges multiple PDF files in the specified order.
     * File reads are parallelized for better I/O throughput.
     */
    static mergePDFs(filePaths, outputFilePath) {
        return withTimeout((async () => {
            // Read all files from disk in parallel (I/O bound)
            const readResults = await Promise.all(filePaths.map(async (filePath) => {
                if (!(await (0, fs_1.fileExists)(filePath))) {
                    throw new Error(`File not found: ${path_1.default.basename(filePath)}`);
                }
                const bytes = await promises_1.default.readFile(filePath);
                return { filePath, bytes };
            }));
            // Process sequentially (CPU bound — pages must be added in order)
            const mergedDoc = await pdf_lib_1.PDFDocument.create();
            for (const { filePath, bytes } of readResults) {
                const doc = await loadPdf(bytes);
                assertPageLimit(doc, path_1.default.basename(filePath));
                const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
                copiedPages.forEach((page) => mergedDoc.addPage(page));
                if (mergedDoc.getPageCount() > config_1.MAX_PAGE_COUNT) {
                    throw new Error(`The merged document would exceed the ${config_1.MAX_PAGE_COUNT}-page limit.`);
                }
            }
            const mergedBytes = await mergedDoc.save();
            await promises_1.default.writeFile(outputFilePath, mergedBytes);
        })());
    }
    /**
     * Splits a PDF file based on custom page ranges or splits every page.
     */
    static splitPDF(filePath, mode, rangesInput, outputDir) {
        return withTimeout((async () => {
            if (!(await (0, fs_1.fileExists)(filePath))) {
                throw new Error('File not found');
            }
            const fileBytes = await promises_1.default.readFile(filePath);
            const srcDoc = await loadPdf(fileBytes);
            assertPageLimit(srcDoc, path_1.default.basename(filePath));
            const totalPages = srcDoc.getPageCount();
            const zip = new jszip_1.default();
            let createdFilesCount = 0;
            let singleOutputFilePath = '';
            if (mode === 'all') {
                // Process all pages — parallelize individual page extraction
                const pagePromises = Array.from({ length: totalPages }, async (_, i) => {
                    const newDoc = await pdf_lib_1.PDFDocument.create();
                    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
                    newDoc.addPage(copiedPage);
                    return { index: i, bytes: await newDoc.save() };
                });
                const pages = await Promise.all(pagePromises);
                for (const { index, bytes } of pages) {
                    zip.file(`page_${index + 1}.pdf`, bytes);
                    createdFilesCount++;
                }
            }
            else {
                for (const range of rangesInput) {
                    const start = Math.max(1, range.start) - 1;
                    const end = Math.min(totalPages, range.end) - 1;
                    if (start > end)
                        continue;
                    const newDoc = await pdf_lib_1.PDFDocument.create();
                    const indices = Array.from({ length: end - start + 1 }, (_, index) => start + index);
                    const copiedPages = await newDoc.copyPages(srcDoc, indices);
                    copiedPages.forEach((page) => newDoc.addPage(page));
                    const pdfBytes = await newDoc.save();
                    const rangeFileName = `pages_${range.start}-${range.end}.pdf`;
                    if (rangesInput.length === 1) {
                        singleOutputFilePath = path_1.default.join(outputDir, rangeFileName);
                        await promises_1.default.writeFile(singleOutputFilePath, pdfBytes);
                        createdFilesCount = 1;
                    }
                    else {
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
                    filename: path_1.default.basename(singleOutputFilePath),
                    isZip: false,
                };
            }
            const zipBytes = await zip.generateAsync({ type: 'nodebuffer' });
            const zipFileName = 'split_result.zip';
            const zipFilePath = path_1.default.join(outputDir, zipFileName);
            await promises_1.default.writeFile(zipFilePath, zipBytes);
            return { path: zipFilePath, filename: zipFileName, isZip: true };
        })());
    }
    /**
     * Compresses a PDF using pdf-lib's object stream compression.
     * Returns actual before/after file sizes.
     */
    static compressPDF(filePath, level, outputFilePath) {
        return withTimeout((async () => {
            if (!(await (0, fs_1.fileExists)(filePath))) {
                throw new Error('File not found');
            }
            const [fileBytes, stats] = await Promise.all([
                promises_1.default.readFile(filePath),
                promises_1.default.stat(filePath),
            ]);
            const originalSize = stats.size;
            const doc = await loadPdf(fileBytes);
            assertPageLimit(doc, path_1.default.basename(filePath));
            // Strip metadata that inflates size
            doc.setTitle('');
            doc.setAuthor('');
            doc.setSubject('');
            doc.setKeywords([]);
            doc.setProducer('');
            doc.setCreator('');
            // Ghostscript compression levels mapping
            const gsLevels = {
                basic: '/printer', // ~300 dpi
                medium: '/ebook', // ~150 dpi
                strong: '/screen' // ~72 dpi
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
            }
            catch (gsError) {
                console.warn('[Compress] Ghostscript failed or not installed, falling back to pdf-lib.', gsError.message);
                // Fallback to pdf-lib if gs is not available
                const compressedBytes = await doc.save({ useObjectStreams: true });
                await promises_1.default.writeFile(outputFilePath, compressedBytes);
            }
            const compressedSize = (await promises_1.default.stat(outputFilePath)).size;
            return { originalSize, compressedSize };
        })());
    }
    /**
     * Rotates pages of a PDF.
     */
    static rotatePDF(filePath, rotations, outputFilePath) {
        return withTimeout((async () => {
            if (!(await (0, fs_1.fileExists)(filePath))) {
                throw new Error('File not found');
            }
            const fileBytes = await promises_1.default.readFile(filePath);
            const doc = await loadPdf(fileBytes);
            assertPageLimit(doc, path_1.default.basename(filePath));
            const totalPages = doc.getPageCount();
            if ('degrees' in rotations && !Array.isArray(rotations)) {
                const deg = rotations.degrees;
                for (let i = 0; i < totalPages; i++) {
                    const page = doc.getPage(i);
                    const current = page.getRotation().angle;
                    page.setRotation((0, pdf_lib_1.degrees)(((current + deg) % 360 + 360) % 360));
                }
            }
            else if (Array.isArray(rotations)) {
                for (const item of rotations) {
                    if (item.pageIndex >= 0 && item.pageIndex < totalPages) {
                        const page = doc.getPage(item.pageIndex);
                        const current = page.getRotation().angle;
                        page.setRotation((0, pdf_lib_1.degrees)(((current + item.degrees) % 360 + 360) % 360));
                    }
                }
            }
            const pdfBytes = await doc.save();
            await promises_1.default.writeFile(outputFilePath, pdfBytes);
        })());
    }
}
exports.PdfService = PdfService;
