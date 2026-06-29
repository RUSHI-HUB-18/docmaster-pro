import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fsSync from 'fs';
import fs from 'fs/promises';
import { upload, checkPdfMagicBytes, assignUploadId } from '../middleware/upload';
import { validateCompress, validateSplit, validateRotate } from '../middleware/validation';
import { PdfService } from '../services/pdfService';
import { UPLOAD_DIR } from '../config';
import { fileExists } from '../utils/fs';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Catch multer file-filter errors and forward them as 400 responses */
const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    // Multer-specific errors (file size, file count, filter rejection)
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ success: false, error: err.message });
  }
  next();
};

/**
 * Validates magic bytes on every uploaded file and cleans up + rejects
 * the entire request if any file fails.
 */
function enforceMagicBytes(req: Request, res: Response, next: NextFunction) {
  const files = (req.files as Express.Multer.File[] | undefined) || [];
  const single = req.file ? [req.file] : [];
  const all = [...files, ...single];

  for (const f of all) {
    if (!checkPdfMagicBytes(f.path)) {
      // Delete all uploaded files for this request immediately
      for (const uploaded of all) {
        try { fsSync.unlinkSync(uploaded.path); } catch {}
      }
      // Remove the session directory if empty
      const sessionDir = path.dirname(all[0].path);
      try {
        if (fsSync.readdirSync(sessionDir).length === 0) fsSync.rmdirSync(sessionDir);
      } catch {}

      return res.status(400).json({
        success: false,
        error: 'File signature validation failed. Only valid PDF files are accepted.',
      });
    }
  }

  next();
}

/**
 * Resolves and validates an output path, ensuring it stays within the
 * user's session directory (prevents path traversal on both uploadId and filename).
 */
function safeSessionPath(uploadId: string, filename: string): string | null {
  const safeUploadId = path.basename(uploadId);
  const safeFilename = path.basename(filename);
  const resolved = path.resolve(UPLOAD_DIR, safeUploadId, safeFilename);
  const uploadRoot = path.resolve(UPLOAD_DIR);

  // The resolved path must start with the uploads root
  if (!resolved.startsWith(uploadRoot + path.sep)) return null;
  return resolved;
}

/** Build the output config for processed files */
const getOutputConfig = (uploadId: string, baseName: string, ext: string) => {
  const safeUploadId = path.basename(uploadId);
  const outFilename = `${baseName}_${Date.now()}${ext}`;
  const outPath = path.join(UPLOAD_DIR, safeUploadId, outFilename);
  const downloadUrl = `/api/pdf/download/${safeUploadId}/${outFilename}`;
  return { outPath, outFilename, downloadUrl };
};


// ─── 1. PDF MERGE ─────────────────────────────────────────────────────────────
router.post(
  '/merge',
  assignUploadId,
  upload.array('files'),
  handleUploadError,
  enforceMagicBytes,
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const uploadId = (req as any).uploadSessionId as string;

      if (!files || files.length < 2) {
        return res.status(400).json({ success: false, error: 'Please upload at least 2 PDF files to merge.' });
      }

      // Determine processing order (client sends index array)
      let order: number[] = [];
      if (req.body.order) {
        try {
          order = JSON.parse(req.body.order);
        } catch {
          order = String(req.body.order).split(',').map(Number);
        }
      }

      let sortedFiles = [...files];
      if (Array.isArray(order) && order.length === files.length) {
        const reordered = order.map((i) => files[i]).filter(Boolean);
        if (reordered.length === files.length) sortedFiles = reordered;
      }

      const filePaths = sortedFiles.map((f) => f.path);
      const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'merged', '.pdf');

      await PdfService.mergePDFs(filePaths, outPath);

      const stats = await fs.stat(outPath);

      return res.json({
        success: true,
        uploadId,
        downloadUrl,
        filename: 'merged.pdf',
        size: stats.size,
        message: 'PDFs merged successfully!',
      });
    } catch (err: any) {
      console.error('[Merge] Error:', err.message, err.stack);
      return res.status(500).json({ success: false, error: 'An error occurred during PDF merge. Please try again.' });
    }
  }
);

// ─── 2. PDF SPLIT ─────────────────────────────────────────────────────────────
router.post(
  '/split',
  assignUploadId,
  upload.single('file'),
  handleUploadError,
  enforceMagicBytes,
  validateSplit,
  async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;
      const uploadId = (req as any).uploadSessionId as string;
      const mode = req.body.mode as 'all' | 'ranges';

      if (!file) {
        return res.status(400).json({ success: false, error: 'Please upload a PDF file to split.' });
      }

      let ranges: { start: number; end: number }[] = [];
      if (mode === 'ranges' && req.body.parsedRanges) {
        ranges = req.body.parsedRanges;
      }

      const userUploadDir = path.join(UPLOAD_DIR, path.basename(uploadId));
      const result = await PdfService.splitPDF(file.path, mode, ranges, userUploadDir);
      const stats = await fs.stat(result.path);

      return res.json({
        success: true,
        uploadId,
        downloadUrl: `/api/pdf/download/${path.basename(uploadId)}/${result.filename}`,
        filename: result.filename,
        size: stats.size,
        isZip: result.isZip,
        message: 'PDF split successfully!',
      });
    } catch (err: any) {
      console.error('[Split] Error:', err.message, err.stack);
      return res.status(500).json({ success: false, error: 'An error occurred during PDF split. Please try again.' });
    }
  }
);

// ─── 3. PDF COMPRESS ──────────────────────────────────────────────────────────
router.post(
  '/compress',
  assignUploadId,
  upload.single('file'),
  handleUploadError,
  enforceMagicBytes,
  validateCompress,
  async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;
      const uploadId = (req as any).uploadSessionId as string;
      const level = req.body.level as 'basic' | 'medium' | 'strong';

      if (!file) {
        return res.status(400).json({ success: false, error: 'Please upload a PDF file to compress.' });
      }

      const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'compressed', '.pdf');
      const sizes = await PdfService.compressPDF(file.path, level, outPath);

      return res.json({
        success: true,
        uploadId,
        downloadUrl,
        filename: 'compressed.pdf',
        originalSize: sizes.originalSize,
        compressedSize: sizes.compressedSize,
        message: 'PDF compressed successfully!',
      });
    } catch (err: any) {
      console.error('[Compress] Error:', err.message, err.stack);
      return res.status(500).json({ success: false, error: 'An error occurred during PDF compression. Please try again.' });
    }
  }
);

// ─── 4. PDF ROTATE ────────────────────────────────────────────────────────────
router.post(
  '/rotate',
  assignUploadId,
  upload.single('file'),
  handleUploadError,
  enforceMagicBytes,
  validateRotate,
  async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;
      const uploadId = (req as any).uploadSessionId as string;

      if (!file) {
        return res.status(400).json({ success: false, error: 'Please upload a PDF file to rotate.' });
      }

      let rotations: { pageIndex: number; degrees: number }[] | { degrees: number };

      if (req.body.parsedRotations) {
        rotations = req.body.parsedRotations;
      } else {
        rotations = { degrees: Number(req.body.degrees) };
      }

      const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'rotated', '.pdf');
      await PdfService.rotatePDF(file.path, rotations, outPath);

      const stats = await fs.stat(outPath);

      return res.json({
        success: true,
        uploadId,
        downloadUrl,
        filename: 'rotated.pdf',
        size: stats.size,
        message: 'PDF rotated successfully!',
      });
    } catch (err: any) {
      console.error('[Rotate] Error:', err.message, err.stack);
      return res.status(500).json({ success: false, error: 'An error occurred during PDF rotation. Please try again.' });
    }
  }
);

// ─── 5. DOWNLOAD ──────────────────────────────────────────────────────────────
router.get('/download/:uploadId/:filename', async (req: Request, res: Response) => {
  const filePath = safeSessionPath(req.params.uploadId, req.params.filename);

  if (!filePath) {
    return res.status(400).json({ success: false, error: 'Invalid request.' });
  }

  if (!(await fileExists(filePath))) {
    return res.status(404).json({ success: false, error: 'File not found or has expired.' });
  }

  // Force download with a safe filename — never reflect user-controlled names
  const safeDownloadName = path.basename(filePath);
  res.setHeader('Content-Disposition', `attachment; filename="${safeDownloadName}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.download(filePath, safeDownloadName);
});

// ─── 6. DELETE ────────────────────────────────────────────────────────────────
router.delete('/delete/:uploadId/:filename', async (req: Request, res: Response) => {
  const filePath = safeSessionPath(req.params.uploadId, req.params.filename);

  if (!filePath) {
    return res.status(400).json({ success: false, error: 'Invalid request.' });
  }

  if (!(await fileExists(filePath))) {
    return res.status(404).json({ success: false, error: 'File not found or already deleted.' });
  }

  try {
    await fs.unlink(filePath);

    // Clean up session dir if now empty
    const sessionDir = path.dirname(filePath);
    try {
      const remaining = await fs.readdir(sessionDir);
      if (remaining.length === 0) await fs.rmdir(sessionDir);
    } catch {}

    return res.json({ success: true, message: 'File deleted successfully.' });
  } catch {
    return res.status(500).json({ success: false, error: 'Could not delete file.' });
  }
});

export default router;
