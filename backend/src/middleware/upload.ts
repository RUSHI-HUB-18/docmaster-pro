import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { UPLOAD_DIR, MAX_FILE_SIZE } from '../config';

// ─── Ensure upload root exists ────────────────────────────────────────────────
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─── Filename sanitization ────────────────────────────────────────────────────
/**
 * Strips all characters that are not alphanumeric, hyphens, underscores, or dots.
 * Limits the result to 100 characters to prevent filesystem abuse.
 * The original name is only used for metadata — it NEVER touches the filesystem path.
 */
export function sanitizeFilename(original: string): string {
  const ext = path.extname(original).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path
    .basename(original, path.extname(original))
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
export function checkPdfMagicBytes(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    // %PDF == 0x25 0x50 0x44 0x46
    return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
  } catch {
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
export function assignUploadId(req: any, res: any, next: any) {
  req.uploadSessionId = crypto.randomUUID();
  next();
}

// ─── Multer storage engine ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    // Use the pre-assigned server-side session ID — never touch req.body
    const sessionId: string = req.uploadSessionId;
    const userUploadDir = path.join(UPLOAD_DIR, sessionId);

    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }

    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    // Always generate a UUID-based filename — the original name never hits disk
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z.]/g, '');
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── MIME-type pre-filter (first layer) ──────────────────────────────────────
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMime = 'application/pdf';
  const allowedExt = /^\.pdf$/;

  const mimeOk = file.mimetype === allowedMime;
  const extOk = allowedExt.test(path.extname(file.originalname).toLowerCase());

  if (mimeOk && extOk) {
    return cb(null, true);
  }

  cb(new Error('Only PDF files are accepted. Executables, scripts, and other file types are rejected.'));
};

// ─── Multer instance ──────────────────────────────────────────────────────────
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 20,         // cap multi-file upload batches
    fields: 10,        // cap number of non-file fields
    fieldNameSize: 100,
    fieldSize: 10 * 1024, // 10 KB max per text field
  },
  fileFilter,
});
