import path from 'path';

export const PORT = process.env.PORT || 5000;
export const UPLOAD_DIR = path.join(__dirname, '../../uploads');
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const CLEANUP_AGE_MS = 60 * 60 * 1000; // 1 hour
export const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // check every 15 minutes
