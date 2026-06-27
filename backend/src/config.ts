import path from 'path';

// ─── File Storage ─────────────────────────────────────────────────────────────
export const PORT = process.env.PORT || 5000;
export const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// ─── File Limits ──────────────────────────────────────────────────────────────
/** 50 MB hard cap on uploaded files */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
/** Reject PDFs with more than this many pages (DoS protection) */
export const MAX_PAGE_COUNT = 500;

// ─── Processing ───────────────────────────────────────────────────────────────
/** Abort any PDF processing operation after this many ms (DoS protection) */
export const PROCESSING_TIMEOUT_MS = 30_000; // 30 seconds

// ─── Retention & Cleanup ──────────────────────────────────────────────────────
/** Files older than this are deleted — 10 minutes */
export const CLEANUP_AGE_MS = 10 * 60 * 1000;
/** How often the cleanup sweep runs — every 5 minutes */
export const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// ─── Rate Limiting ────────────────────────────────────────────────────────────
/** Window for rate-limiting buckets */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
