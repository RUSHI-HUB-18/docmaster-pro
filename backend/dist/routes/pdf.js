"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const upload_1 = require("../middleware/upload");
const validation_1 = require("../middleware/validation");
const pdfService_1 = require("../services/pdfService");
const config_1 = require("../config");
const fs_2 = require("../utils/fs");
const router = (0, express_1.Router)();
// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Catch multer file-filter errors and forward them as 400 responses */
const handleUploadError = (err, req, res, next) => {
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
function enforceMagicBytes(req, res, next) {
    const files = req.files || [];
    const single = req.file ? [req.file] : [];
    const all = [...files, ...single];
    for (const f of all) {
        if (!(0, upload_1.checkPdfMagicBytes)(f.path)) {
            // Delete all uploaded files for this request immediately
            for (const uploaded of all) {
                try {
                    fs_1.default.unlinkSync(uploaded.path);
                }
                catch { }
            }
            // Remove the session directory if empty
            const sessionDir = path_1.default.dirname(all[0].path);
            try {
                if (fs_1.default.readdirSync(sessionDir).length === 0)
                    fs_1.default.rmdirSync(sessionDir);
            }
            catch { }
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
function safeSessionPath(uploadId, filename) {
    const safeUploadId = path_1.default.basename(uploadId);
    const safeFilename = path_1.default.basename(filename);
    const resolved = path_1.default.resolve(config_1.UPLOAD_DIR, safeUploadId, safeFilename);
    const uploadRoot = path_1.default.resolve(config_1.UPLOAD_DIR);
    // The resolved path must start with the uploads root
    if (!resolved.startsWith(uploadRoot + path_1.default.sep))
        return null;
    return resolved;
}
/** Build the output config for processed files */
const getOutputConfig = (uploadId, baseName, ext) => {
    const safeUploadId = path_1.default.basename(uploadId);
    const outFilename = `${baseName}_${Date.now()}${ext}`;
    const outPath = path_1.default.join(config_1.UPLOAD_DIR, safeUploadId, outFilename);
    const downloadUrl = `/api/pdf/download/${safeUploadId}/${outFilename}`;
    return { outPath, outFilename, downloadUrl };
};
// ─── 1. PDF MERGE ─────────────────────────────────────────────────────────────
router.post('/merge', upload_1.assignUploadId, upload_1.upload.array('files'), handleUploadError, enforceMagicBytes, async (req, res) => {
    try {
        const files = req.files;
        const uploadId = req.uploadSessionId;
        if (!files || files.length < 2) {
            return res.status(400).json({ success: false, error: 'Please upload at least 2 PDF files to merge.' });
        }
        // Determine processing order (client sends index array)
        let order = [];
        if (req.body.order) {
            try {
                order = JSON.parse(req.body.order);
            }
            catch {
                order = String(req.body.order).split(',').map(Number);
            }
        }
        let sortedFiles = [...files];
        if (Array.isArray(order) && order.length === files.length) {
            const reordered = order.map((i) => files[i]).filter(Boolean);
            if (reordered.length === files.length)
                sortedFiles = reordered;
        }
        const filePaths = sortedFiles.map((f) => f.path);
        const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'merged', '.pdf');
        await pdfService_1.PdfService.mergePDFs(filePaths, outPath);
        const stats = await promises_1.default.stat(outPath);
        return res.json({
            success: true,
            uploadId,
            downloadUrl,
            filename: 'merged.pdf',
            size: stats.size,
            message: 'PDFs merged successfully!',
        });
    }
    catch (err) {
        console.error('[Merge] Error:', err.message, err.stack);
        return res.status(500).json({ success: false, error: 'An error occurred during PDF merge. Please try again.' });
    }
});
// ─── 2. PDF SPLIT ─────────────────────────────────────────────────────────────
router.post('/split', upload_1.assignUploadId, upload_1.upload.single('file'), handleUploadError, enforceMagicBytes, validation_1.validateSplit, async (req, res) => {
    try {
        const file = req.file;
        const uploadId = req.uploadSessionId;
        const mode = req.body.mode;
        if (!file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file to split.' });
        }
        let ranges = [];
        if (mode === 'ranges' && req.body.parsedRanges) {
            ranges = req.body.parsedRanges;
        }
        const userUploadDir = path_1.default.join(config_1.UPLOAD_DIR, path_1.default.basename(uploadId));
        const result = await pdfService_1.PdfService.splitPDF(file.path, mode, ranges, userUploadDir);
        const stats = await promises_1.default.stat(result.path);
        return res.json({
            success: true,
            uploadId,
            downloadUrl: `/api/pdf/download/${path_1.default.basename(uploadId)}/${result.filename}`,
            filename: result.filename,
            size: stats.size,
            isZip: result.isZip,
            message: 'PDF split successfully!',
        });
    }
    catch (err) {
        console.error('[Split] Error:', err.message, err.stack);
        return res.status(500).json({ success: false, error: 'An error occurred during PDF split. Please try again.' });
    }
});
// ─── 3. PDF COMPRESS ──────────────────────────────────────────────────────────
router.post('/compress', upload_1.assignUploadId, upload_1.upload.single('file'), handleUploadError, enforceMagicBytes, validation_1.validateCompress, async (req, res) => {
    try {
        const file = req.file;
        const uploadId = req.uploadSessionId;
        const level = req.body.level;
        if (!file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file to compress.' });
        }
        const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'compressed', '.pdf');
        const sizes = await pdfService_1.PdfService.compressPDF(file.path, level, outPath);
        return res.json({
            success: true,
            uploadId,
            downloadUrl,
            filename: 'compressed.pdf',
            originalSize: sizes.originalSize,
            compressedSize: sizes.compressedSize,
            message: 'PDF compressed successfully!',
        });
    }
    catch (err) {
        console.error('[Compress] Error:', err.message, err.stack);
        return res.status(500).json({ success: false, error: 'An error occurred during PDF compression. Please try again.' });
    }
});
// ─── 4. PDF ROTATE ────────────────────────────────────────────────────────────
router.post('/rotate', upload_1.assignUploadId, upload_1.upload.single('file'), handleUploadError, enforceMagicBytes, validation_1.validateRotate, async (req, res) => {
    try {
        const file = req.file;
        const uploadId = req.uploadSessionId;
        if (!file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file to rotate.' });
        }
        let rotations;
        if (req.body.parsedRotations) {
            rotations = req.body.parsedRotations;
        }
        else {
            rotations = { degrees: Number(req.body.degrees) };
        }
        const { outPath, outFilename, downloadUrl } = getOutputConfig(uploadId, 'rotated', '.pdf');
        await pdfService_1.PdfService.rotatePDF(file.path, rotations, outPath);
        const stats = await promises_1.default.stat(outPath);
        return res.json({
            success: true,
            uploadId,
            downloadUrl,
            filename: 'rotated.pdf',
            size: stats.size,
            message: 'PDF rotated successfully!',
        });
    }
    catch (err) {
        console.error('[Rotate] Error:', err.message, err.stack);
        return res.status(500).json({ success: false, error: 'An error occurred during PDF rotation. Please try again.' });
    }
});
// ─── 5. DOWNLOAD ──────────────────────────────────────────────────────────────
router.get('/download/:uploadId/:filename', async (req, res) => {
    const filePath = safeSessionPath(req.params.uploadId, req.params.filename);
    if (!filePath) {
        return res.status(400).json({ success: false, error: 'Invalid request.' });
    }
    if (!(await (0, fs_2.fileExists)(filePath))) {
        return res.status(404).json({ success: false, error: 'File not found or has expired.' });
    }
    // Force download with a safe filename — never reflect user-controlled names
    const safeDownloadName = path_1.default.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${safeDownloadName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.download(filePath, safeDownloadName);
});
// ─── 6. DELETE ────────────────────────────────────────────────────────────────
router.delete('/delete/:uploadId/:filename', async (req, res) => {
    const filePath = safeSessionPath(req.params.uploadId, req.params.filename);
    if (!filePath) {
        return res.status(400).json({ success: false, error: 'Invalid request.' });
    }
    if (!(await (0, fs_2.fileExists)(filePath))) {
        return res.status(404).json({ success: false, error: 'File not found or already deleted.' });
    }
    try {
        await promises_1.default.unlink(filePath);
        // Clean up session dir if now empty
        const sessionDir = path_1.default.dirname(filePath);
        try {
            const remaining = await promises_1.default.readdir(sessionDir);
            if (remaining.length === 0)
                await promises_1.default.rmdir(sessionDir);
        }
        catch { }
        return res.json({ success: true, message: 'File deleted successfully.' });
    }
    catch {
        return res.status(500).json({ success: false, error: 'Could not delete file.' });
    }
});
exports.default = router;
