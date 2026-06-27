import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_DIR, CLEANUP_AGE_MS } from '../config';

/**
 * Checks whether a path exists using async fs.
 */
async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Runs a cleanup sweep over the uploads directory.
 * Deletes any session folder (and all its contents) whose CREATION time
 * is older than CLEANUP_AGE_MS. Using birthtime (creation time) rather than
 * mtime prevents files from being kept alive by incidental write operations.
 *
 * Fully async — never blocks the Node.js event loop.
 */
export async function runCleanup(): Promise<void> {
  if (!(await pathExists(UPLOAD_DIR))) return;

  let swept = 0;
  let deleted = 0;

  try {
    const entries = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();

    // Process entries concurrently for faster cleanup
    const results = await Promise.allSettled(
      entries.map(async (entry) => {
        const entryPath = path.join(UPLOAD_DIR, entry);

        try {
          const stats = await fs.stat(entryPath);

          // Use birthtime (creation time) as the age anchor.
          // Fall back to mtime if birthtimeMs is unavailable (some Linux filesystems).
          const createdAt = stats.birthtimeMs > 0 ? stats.birthtimeMs : stats.mtimeMs;
          const age = now - createdAt;

          if (age > CLEANUP_AGE_MS) {
            if (stats.isDirectory()) {
              await fs.rm(entryPath, { recursive: true, force: true });
              console.log(`[Cleanup] Removed session directory: ${entry} (age: ${Math.round(age / 1000)}s)`);
            } else {
              // Orphaned top-level file — should not exist in normal operation
              await fs.unlink(entryPath);
              console.log(`[Cleanup] Removed orphaned file: ${entry}`);
            }
            return 'deleted' as const;
          }
          return 'kept' as const;
        } catch (entryErr) {
          // Log the error but continue sweeping other entries
          console.error(`[Cleanup] Could not process entry "${entry}":`, (entryErr as Error).message);
          return 'error' as const;
        }
      })
    );

    for (const result of results) {
      swept++;
      if (result.status === 'fulfilled' && result.value === 'deleted') {
        deleted++;
      }
    }
  } catch (err) {
    console.error('[Cleanup] Failed to read uploads directory:', (err as Error).message);
  }

  if (deleted > 0 || swept > 0) {
    console.log(`[Cleanup] Sweep complete — checked: ${swept}, removed: ${deleted}`);
  }
}
