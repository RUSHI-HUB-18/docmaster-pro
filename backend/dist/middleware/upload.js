"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.sanitizeFilename = sanitizeFilename;
exports.checkPdfMagicBytes = checkPdfMagicBytes;
exports.assignUploadId = assignUploadId;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
// ─── Ensure upload root exists ────────────────────────────────────────────────
if (!fs_1.default.existsSync(config_1.UPLOAD_DIR)) {
    fs_1.default.mkdirSync(config_1.UPLOAD_DIR, { recursive: true });
}
// ─── Filename sanitization ────────────────────────────────────────────────────
/**
 * Strips all characters that are not alphanumeric, hyphens, underscores, or dots.
 * Limits the result to 100 characters to prevent filesystem abuse.
 * The original name is only used for metadata — it NEVER touches the filesystem path.
 */
function sanitizeFilename(original) {
    const ext = path_1.default.extname(original).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const base = path_1.default
        .basename(original, path_1.default.extname(original))
        .replace(/[^a-zA-Z0-9_\-]/g, '_')
        .slice(0, 80);
    return `${base}${ext}`;
}
// ─── Magic-byte (file signature) validation ───────────────────────────────────
/**
 * Reads the first 4 bytes of a saved file and verifies they match the PDF
 * magic number: 25 50 44 46 (%PDF).
 * This is called AFTER multer saves the file to disk, via a post-save hook
 * in the route layer (see validatePdfSignature export below).
 */
function checkPdfMagicBytes(filePath) {
    try {
        const fd = fs_1.default.openSync(filePath, 'r');
        const buf = Buffer.alloc(4);
        fs_1.default.readSync(fd, buf, 0, 4, 0);
        fs_1.default.closeSync(fd);
        // %PDF == 0x25 0x50 0x44 0x46
        return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    }
    catch {
        return false;
    }
}
// ─── Pre-upload middleware: assign server-side upload ID ──────────────────────
/**
 * Must be applied BEFORE the multer middleware.
 * Sets req.uploadSessionId to a fresh UUID that cannot be influenced by the
 * client — even if the client sends uploadId or _serverUploadId as form fields,
 * those values are completely ignored.
 */
function assignUploadId(req, res, next) {
    req.uploadSessionId = crypto_1.default.randomUUID();
    next();
}
// ─── Multer storage engine ────────────────────────────────────────────────────
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Use the pre-assigned server-side session ID — never touch req.body
        const sessionId = req.uploadSessionId;
        const userUploadDir = path_1.default.join(config_1.UPLOAD_DIR, sessionId);
        if (!fs_1.default.existsSync(userUploadDir)) {
            fs_1.default.mkdirSync(userUploadDir, { recursive: true });
        }
        cb(null, userUploadDir);
    },
    filename: (req, file, cb) => {
        // Always generate a UUID-based filename — the original name never hits disk
        const ext = path_1.default.extname(file.originalname).toLowerCase().replace(/[^a-z.]/g, '');
        const uniqueName = `${crypto_1.default.randomUUID()}${ext}`;
        cb(null, uniqueName);
    },
});
// ─── MIME-type pre-filter (first layer) ──────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowedMime = 'application/pdf';
    const allowedExt = /^\.pdf$/;
    const mimeOk = file.mimetype === allowedMime;
    const extOk = allowedExt.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimeOk && extOk) {
        return cb(null, true);
    }
    cb(new Error('Only PDF files are accepted. Executables, scripts, and other file types are rejected.'));
};
// ─── Multer instance ──────────────────────────────────────────────────────────
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: config_1.MAX_FILE_SIZE,
        files: 20, // cap multi-file upload batches
        fields: 10, // cap number of non-file fields
        fieldNameSize: 100,
        fieldSize: 10 * 1024, // 10 KB max per text field
    },
    fileFilter,
});
