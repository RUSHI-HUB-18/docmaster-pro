"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const pdf_1 = __importDefault(require("./routes/pdf"));
const config_1 = require("./config");
const cleanup_1 = require("./utils/cleanup");
dotenv_1.default.config();
const app = (0, express_1.default)();
// ─── Response Compression (gzip / Brotli) ─────────────────────────────────────
// Applied early so all responses (JSON, file streams) benefit from compression.
// Skip already-compressed content (PDFs, ZIPs) to avoid wasting CPU.
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        // Skip compression for already-compressed file downloads
        const contentType = res.getHeader('Content-Type');
        if (typeof contentType === 'string' &&
            (contentType.includes('application/pdf') ||
                contentType.includes('application/zip') ||
                contentType.includes('application/octet-stream'))) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
}));
// ─── HTTP Security Headers (Helmet) ──────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            frameSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    hidePoweredBy: true, // Remove X-Powered-By
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    ieNoOpen: true,
    noSniff: true, // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
}));
// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production, replace '*' with your exact frontend domain, e.g.:
// origin: process.env.FRONTEND_URL || 'https://yourdomain.com'
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Content-Disposition'],
    credentials: false,
}));
// ─── Body Size Limits ─────────────────────────────────────────────────────────
// Multipart/file bodies are limited by multer. These caps protect JSON/URL bodies.
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// ─── Rate Limiters ────────────────────────────────────────────────────────────
const standardHeaders = true; // Return rate limit info in headers
const legacyHeaders = false; // Disable deprecated X-RateLimit-* headers
/** General API limiter — applied to all /api routes */
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.RATE_LIMIT_WINDOW_MS,
    max: 100,
    standardHeaders,
    legacyHeaders,
    message: { success: false, error: 'Too many requests. Please try again later.' },
});
/** Strict limiter for upload/processing endpoints (resource-intensive) */
const uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.RATE_LIMIT_WINDOW_MS,
    max: 20,
    standardHeaders,
    legacyHeaders,
    message: { success: false, error: 'Upload rate limit reached. Please wait before uploading again.' },
});
/** Download limiter */
const downloadLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.RATE_LIMIT_WINDOW_MS,
    max: 60,
    standardHeaders,
    legacyHeaders,
    message: { success: false, error: 'Download rate limit reached. Please try again shortly.' },
});
/** Delete limiter */
const deleteLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.RATE_LIMIT_WINDOW_MS,
    max: 30,
    standardHeaders,
    legacyHeaders,
    message: { success: false, error: 'Delete rate limit reached.' },
});
// Apply general limiter to all API routes
app.use('/api', generalLimiter);
// Apply specific limiters to processing routes
app.use('/api/pdf/merge', uploadLimiter);
app.use('/api/pdf/split', uploadLimiter);
app.use('/api/pdf/compress', uploadLimiter);
app.use('/api/pdf/rotate', uploadLimiter);
app.use('/api/pdf/download', downloadLimiter);
app.use('/api/pdf/delete', deleteLimiter);
// ─── Request Logging (sanitized — no file paths, no bodies) ──────────────────
app.use((req, res, next) => {
    // Only log method + path — never log headers, bodies, or file paths
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/pdf', pdf_1.default);
// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found.' });
});
// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    // Log internally but NEVER expose stack traces or internal paths to the client
    console.error('[Error] Unhandled:', err.message);
    res.status(500).json({
        success: false,
        error: 'An internal error occurred. Please try again.',
    });
});
// ─── Cleanup Scheduler ────────────────────────────────────────────────────────
setInterval(() => {
    try {
        (0, cleanup_1.runCleanup)();
    }
    catch (err) {
        console.error('[Cleanup] Scheduler error:', err.message);
    }
}, config_1.CLEANUP_INTERVAL_MS);
// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config_1.PORT, () => {
    console.log('=========================================');
    console.log(` DocMaster Pro backend — port ${config_1.PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log('=========================================');
    // Run an initial sweep on startup to clear any leftover files
    (0, cleanup_1.runCleanup)();
});
