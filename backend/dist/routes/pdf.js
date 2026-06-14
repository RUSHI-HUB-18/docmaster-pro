"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const upload_1 = require("../middleware/upload");
const pdfService_1 = require("../services/pdfService");
const config_1 = require("../config");
const router = (0, express_1.Router)();
// Middleware to catch upload file filter errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof Error) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
};
/**
 * Helper to get output path and URL for processed files
 */
const getOutputConfig = (uploadId, baseName, ext) => {
    const userUploadDir = path_1.default.join(config_1.UPLOAD_DIR, uploadId);
    const outFilename = `${baseName}_${Date.now()}${ext}`;
    const outPath = path_1.default.join(userUploadDir, outFilename);
    const downloadUrl = `/api/pdf/download/${uploadId}/${outFilename}`;
    return { outPath, outFilename, downloadUrl };
};
/**
 * 1. PDF MERGE
 */
router.post('/merge', upload_1.upload.array('files'), handleUploadError, async (req, res) => {
    try {
        const files = req.files;
        const uploadId = req.body.uploadId;
        if (!files || files.length < 2) {
            return res.status(400).json({ success: false, error: 'Please upload at least 2 PDF files to merge.' });
        }
        // Determine processing order
        let order = [];
        if (req.body.order) {
            try {
                order = JSON.parse(req.body.order);
            }
            catch (e) {
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
        await pdfService_1.PdfService.mergePDFs(filePaths, outPath);
        const stats = fs_1.default.statSync(outPath);
        res.json({
            success: true,
            downloadUrl,
            filename: 'merged.pdf',
            size: stats.size,
            message: 'PDFs merged successfully!'
        });
    }
    catch (err) {
        console.error('Merge error:', err);
        res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF merge.' });
    }
});
/**
 * 2. PDF SPLIT
 */
router.post('/split', upload_1.upload.single('file'), handleUploadError, async (req, res) => {
    try {
        const file = req.file;
        const uploadId = req.body.uploadId;
        const mode = req.body.mode || 'all'; // 'all' or 'ranges'
        if (!file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file to split.' });
        }
        let ranges = [];
        if (mode === 'ranges' && req.body.ranges) {
            try {
                ranges = JSON.parse(req.body.ranges);
            }
            catch (e) {
                return res.status(400).json({ success: false, error: 'Invalid ranges format. Must be JSON array.' });
            }
        }
        const userUploadDir = path_1.default.join(config_1.UPLOAD_DIR, uploadId);
        const result = await pdfService_1.PdfService.splitPDF(file.path, mode, ranges, userUploadDir);
        const stats = fs_1.default.statSync(result.path);
        res.json({
            success: true,
            downloadUrl: `/api/pdf/download/${uploadId}/${result.filename}`,
            filename: result.filename,
            size: stats.size,
            isZip: result.isZip,
            message: 'PDF split successfully!'
        });
    }
    catch (err) {
        console.error('Split error:', err);
        res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF split.' });
    }
});
/**
 * 3. PDF COMPRESS
 */
router.post('/compress', upload_1.upload.single('file'), handleUploadError, async (req, res) => {
    try {
        const file = req.file;
        const uploadId = req.body.uploadId;
        const level = req.body.level || 'medium'; // 'basic', 'medium', 'strong'
        if (!file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file to compress.' });
        }
        const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'compressed', '.pdf');
        const sizes = await pdfService_1.PdfService.compressPDF(file.path, level, outPath);
        res.json({
            success: true,
            downloadUrl,
            filename: 'compressed.pdf',
            originalSize: sizes.originalSize,
            compressedSize: sizes.compressedSize,
            message: 'PDF compressed successfully!'
        });
    }
    catch (err) {
        console.error('Compression error:', err);
        res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF compression.' });
    }
});
/**
 * 4. ROTATE PDF
 */
router.post('/rotate', upload_1.upload.single('file'), handleUploadError, async (req, res) => {
    try {
        const file = req.file;
        const uploadId = req.body.uploadId;
        if (!file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file to rotate.' });
        }
        let rotations;
        if (req.body.rotations) {
            try {
                rotations = JSON.parse(req.body.rotations);
            }
            catch (e) {
                return res.status(400).json({ success: false, error: 'Invalid rotations format. Must be JSON.' });
            }
        }
        else if (req.body.degrees) {
            rotations = { degrees: Number(req.body.degrees) };
        }
        else {
            return res.status(400).json({ success: false, error: 'Please specify rotations or degrees.' });
        }
        const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'rotated', '.pdf');
        await pdfService_1.PdfService.rotatePDF(file.path, rotations, outPath);
        const stats = fs_1.default.statSync(outPath);
        res.json({
            success: true,
            downloadUrl,
            filename: 'rotated.pdf',
            size: stats.size,
            message: 'PDF rotated successfully!'
        });
    }
    catch (err) {
        console.error('Rotation error:', err);
        res.status(500).json({ success: false, error: err.message || 'Error occurred during PDF rotation.' });
    }
});
/**
 * 5. DOWNLOAD ROUTE
 */
router.get('/download/:uploadId/:filename', (req, res) => {
    const { uploadId, filename } = req.params;
    // Security check: prevent directory traversal
    const safeFilename = path_1.default.basename(filename);
    const safeUploadId = path_1.default.basename(uploadId);
    const filePath = path_1.default.join(config_1.UPLOAD_DIR, safeUploadId, safeFilename);
    if (fs_1.default.existsSync(filePath)) {
        res.download(filePath, safeFilename);
    }
    else {
        res.status(404).json({ success: false, error: 'Requested file not found or has expired.' });
    }
});
/**
 * 6. DELETE ROUTE (for manual deletion in Download Center)
 */
router.delete('/delete/:uploadId/:filename', (req, res) => {
    const { uploadId, filename } = req.params;
    const safeFilename = path_1.default.basename(filename);
    const safeUploadId = path_1.default.basename(uploadId);
    const filePath = path_1.default.join(config_1.UPLOAD_DIR, safeUploadId, safeFilename);
    if (fs_1.default.existsSync(filePath)) {
        try {
            fs_1.default.unlinkSync(filePath);
            // If folder is empty, clean it up too
            const dirPath = path_1.default.dirname(filePath);
            const remainingFiles = fs_1.default.readdirSync(dirPath);
            if (remainingFiles.length === 0) {
                fs_1.default.rmdirSync(dirPath);
            }
            res.json({ success: true, message: 'File deleted successfully.' });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Could not delete file.' });
        }
    }
    else {
        res.status(404).json({ success: false, error: 'File already deleted or expired.' });
    }
});
exports.default = router;
