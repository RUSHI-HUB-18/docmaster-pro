import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR, CLEANUP_AGE_MS } from '../config';

export function runCleanup() {
  console.log('[Cleanup] Starting sweep of upload directory...');
  
  if (!fs.existsSync(UPLOAD_DIR)) {
    return;
  }

  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > CLEANUP_AGE_MS) {
          // Delete file or folder recursively
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`[Cleanup] Deleted directory: ${file}`);
          } else {
            fs.unlinkSync(filePath);
            console.log(`[Cleanup] Deleted file: ${file}`);
          }
        }
      } catch (fileErr) {
        console.error(`[Cleanup] Error processing ${file}:`, fileErr);
      }
    }
  } catch (err) {
    console.error('[Cleanup] Error reading uploads directory:', err);
  }
}
