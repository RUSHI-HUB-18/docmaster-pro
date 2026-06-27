"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_WINDOW_MS = exports.CLEANUP_INTERVAL_MS = exports.CLEANUP_AGE_MS = exports.PROCESSING_TIMEOUT_MS = exports.MAX_PAGE_COUNT = exports.MAX_FILE_SIZE = exports.UPLOAD_DIR = exports.PORT = void 0;
const path_1 = __importDefault(require("path"));
// ─── File Storage ─────────────────────────────────────────────────────────────
exports.PORT = process.env.PORT || 5000;
exports.UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
// ─── File Limits ──────────────────────────────────────────────────────────────
/** 50 MB hard cap on uploaded files */
exports.MAX_FILE_SIZE = 50 * 1024 * 1024;
/** Reject PDFs with more than this many pages (DoS protection) */
exports.MAX_PAGE_COUNT = 500;
// ─── Processing ───────────────────────────────────────────────────────────────
/** Abort any PDF processing operation after this many ms (DoS protection) */
exports.PROCESSING_TIMEOUT_MS = 30_000; // 30 seconds
// ─── Retention & Cleanup ──────────────────────────────────────────────────────
/** Files older than this are deleted — 10 minutes */
exports.CLEANUP_AGE_MS = 10 * 60 * 1000;
/** How often the cleanup sweep runs — every 5 minutes */
exports.CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
// ─── Rate Limiting ────────────────────────────────────────────────────────────
/** Window for rate-limiting buckets */
exports.RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
