import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pdfRoutes from './routes/pdf';
import { PORT, CLEANUP_INTERVAL_MS, RATE_LIMIT_WINDOW_MS } from './config';
import { runCleanup } from './utils/cleanup';

dotenv.config();

const app = express();

// ─── Response Compression (gzip / Brotli) ─────────────────────────────────────
// Applied early so all responses (JSON, file streams) benefit from compression.
// Skip already-compressed content (PDFs, ZIPs) to avoid wasting CPU.
app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      // Skip compression for already-compressed file downloads
      const contentType = res.getHeader('Content-Type');
      if (
        typeof contentType === 'string' &&
        (contentType.includes('application/pdf') ||
         contentType.includes('application/zip') ||
         contentType.includes('application/octet-stream'))
      ) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// ─── HTTP Security Headers (Helmet) ──────────────────────────────────────────
app.use(
  helmet({
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
    frameguard: { action: 'deny' },           // X-Frame-Options: DENY
    hidePoweredBy: true,                       // Remove X-Powered-By
    hsts: {
      maxAge: 31536000,                        // 1 year
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,                             // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production, replace '*' with your exact frontend domain, e.g.:
// origin: process.env.FRONTEND_URL || 'https://yourdomain.com'
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Content-Disposition'],
    credentials: false,
  })
);

// ─── Body Size Limits ─────────────────────────────────────────────────────────
// Multipart/file bodies are limited by multer. These caps protect JSON/URL bodies.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const standardHeaders = true;  // Return rate limit info in headers
const legacyHeaders = false;   // Disable deprecated X-RateLimit-* headers

/** General API limiter — applied to all /api routes */
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 100,
  standardHeaders,
  legacyHeaders,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

/** Strict limiter for upload/processing endpoints (resource-intensive) */
const uploadLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 20,
  standardHeaders,
  legacyHeaders,
  message: { success: false, error: 'Upload rate limit reached. Please wait before uploading again.' },
});

/** Download limiter */
const downloadLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 60,
  standardHeaders,
  legacyHeaders,
  message: { success: false, error: 'Download rate limit reached. Please try again shortly.' },
});

/** Delete limiter */
const deleteLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
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
app.use((req: Request, res: Response, next: NextFunction) => {
  // Only log method + path — never log headers, bodies, or file paths
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/pdf', pdfRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
    runCleanup();
  } catch (err) {
    console.error('[Cleanup] Scheduler error:', (err as Error).message);
  }
}, CLEANUP_INTERVAL_MS);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('=========================================');
  console.log(` DocMaster Pro backend — port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('=========================================');

  // Run an initial sweep on startup to clear any leftover files
  runCleanup();
});
