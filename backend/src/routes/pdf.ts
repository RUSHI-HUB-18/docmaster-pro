import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { upload } from '../middleware/upload';
import { PdfService } from '../services/pdfService';
import { UPLOAD_DIR } from '../config';

const router = Router();

// Middleware to catch upload file filter errors
const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next(err);
};

/**
 * Helper to get output path and URL for processed files
 */
const getOutputConfig = (uploadId: string, baseName: string, ext: string) => {
  const userUploadDir = path.join(UPLOAD_DIR, uploadId);
  const outFilename = `${baseName}_${Date.now()}${ext}`;
  const outPath = path.join(userUploadDir, outFilename);
  const downloadUrl = `/api/pdf/download/${uploadId}/${outFilename}`;
  return { outPath, outFilename, downloadUrl };
};

/**
 * 1. PDF MERGE
 */
router.post('/merge', upload.array('files'), handleUploadError, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const uploadId = req.body.uploadId;

    if (!files || files.length < 2) {
      return res.status(400).json({ success: false, error: 'Please upload at least 2 PDF files to merge.' });
    }

    // Determine processing order
    let order: number[] = [];
    if (req.body.order) {
      try {
        order = JSON.parse(req.body.order);
      } catch (e) {
        // Fallback to comma separated
        order = String(req.body.order).split(',').map(Number);
      }
    }

    // Sort files based on order array if valid
    let sortedFiles = [...files];
    if (order.length === files.length) {
      sortedFiles = order.map(index => files[index]).filter(Boolean);
    }

    const filePaths = sortedFiles.map(file => file.path);
    const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'merged', '.pdf');

    await PdfService.mergePDFs(filePaths, outPath);

    const stats = fs.statSync(outPath);

    res.json({
      success: true,
      downloadUrl,
      filename: 'merged.pdf',
      size: stats.size,
      message: 'PDFs merged successfully!'
    });
  } catch (err: any) {
    console.error('Merge error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF merge.' });
  }
});

/**
 * 2. PDF SPLIT
 */
router.post('/split', upload.single('file'), handleUploadError, async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    const uploadId = req.body.uploadId;
    const mode = req.body.mode || 'all'; // 'all' or 'ranges'

    if (!file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF file to split.' });
    }

    let ranges: { start: number; end: number }[] = [];
    if (mode === 'ranges' && req.body.ranges) {
      try {
        ranges = JSON.parse(req.body.ranges);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid ranges format. Must be JSON array.' });
      }
    }

    const userUploadDir = path.join(UPLOAD_DIR, uploadId);
    const result = await PdfService.splitPDF(file.path, mode, ranges, userUploadDir);

    const stats = fs.statSync(result.path);

    res.json({
      success: true,
      downloadUrl: `/api/pdf/download/${uploadId}/${result.filename}`,
      filename: result.filename,
      size: stats.size,
      isZip: result.isZip,
      message: 'PDF split successfully!'
    });
  } catch (err: any) {
    console.error('Split error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF split.' });
  }
});

/**
 * 3. PDF COMPRESS
 */
router.post('/compress', upload.single('file'), handleUploadError, async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    const uploadId = req.body.uploadId;
    const level = req.body.level || 'medium'; // 'basic', 'medium', 'strong'

    if (!file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF file to compress.' });
    }

    const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'compressed', '.pdf');

    const sizes = await PdfService.compressPDF(file.path, level, outPath);

    res.json({
      success: true,
      downloadUrl,
      filename: 'compressed.pdf',
      originalSize: sizes.originalSize,
      compressedSize: sizes.compressedSize,
      message: 'PDF compressed successfully!'
    });
  } catch (err: any) {
    console.error('Compression error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF compression.' });
  }
});

/**
 * 4. ROTATE PDF
 */
router.post('/rotate', upload.single('file'), handleUploadError, async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    const uploadId = req.body.uploadId;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF file to rotate.' });
    }

    let rotations: { pageIndex: number; degrees: number }[] | { degrees: number };

    if (req.body.rotations) {
      try {
        rotations = JSON.parse(req.body.rotations);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid rotations format. Must be JSON.' });
      }
    } else if (req.body.degrees) {
      rotations = { degrees: Number(req.body.degrees) };
    } else {
      return res.status(400).json({ success: false, error: 'Please specify rotations or degrees.' });
    }

    const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'rotated', '.pdf');

    await PdfService.rotatePDF(file.path, rotations, outPath);

    const stats = fs.statSync(outPath);

    res.json({
      success: true,
      downloadUrl,
      filename: 'rotated.pdf',
      size: stats.size,
      message: 'PDF rotated successfully!'
    });
  } catch (err: any) {
    console.error('Rotation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF rotation.' });
  }
});

/**
 * 5. DOWNLOAD ROUTE
 */
router.get('/download/:uploadId/:filename', (req: Request, res: Response) => {
  const { uploadId, filename } = req.params;
  
  // Security check: prevent directory traversal
  const safeFilename = path.basename(filename);
  const safeUploadId = path.basename(uploadId);
  const filePath = path.join(UPLOAD_DIR, safeUploadId, safeFilename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, safeFilename);
  } else {
    res.status(404).json({ success: false, error: 'Requested file not found or has expired.' });
  }
});

/**
 * 6. DELETE ROUTE (for manual deletion in Download Center)
 */
router.delete('/delete/:uploadId/:filename', (req: Request, res: Response) => {
  const { uploadId, filename } = req.params;
  
  const safeFilename = path.basename(filename);
  const safeUploadId = path.basename(uploadId);
  const filePath = path.join(UPLOAD_DIR, safeUploadId, safeFilename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      
      // If folder is empty, clean it up too
      const dirPath = path.dirname(filePath);
      const remainingFiles = fs.readdirSync(dirPath);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(dirPath);
      }
      
      res.json({ success: true, message: 'File deleted successfully.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Could not delete file.' });
    }
  } else {
    res.status(404).json({ success: false, error: 'File already deleted or expired.' });
  }
});

export default router;
