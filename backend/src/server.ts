import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pdfRoutes from './routes/pdf';
import { PORT, CLEANUP_INTERVAL_MS } from './config';
import { runCleanup } from './utils/cleanup';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For development flexibility; restrict in production
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/pdf', pdfRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'An internal server error occurred.'
  });
});

// Initialize automatic file cleanup timer
setInterval(() => {
  try {
    runCleanup();
  } catch (err) {
    console.error('Cleanup scheduler error:', err);
  }
}, CLEANUP_INTERVAL_MS);

// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` PDFMaster Pro backend listening on port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Upload dir: ${require('./config').UPLOAD_DIR}`);
  console.log(`=========================================`);
  
  // Run an initial sweep on start
  runCleanup();
});
