"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCleanup = runCleanup;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const fs_1 = require("./fs");
/**
 * Runs a cleanup sweep over the uploads directory.
 * Deletes any session folder (and all its contents) whose CREATION time
 * is older than CLEANUP_AGE_MS. Using birthtime (creation time) rather than
 * mtime prevents files from being kept alive by incidental write operations.
 *
 * Fully async — never blocks the Node.js event loop.
 */
async function runCleanup() {
    if (!(await (0, fs_1.fileExists)(config_1.UPLOAD_DIR)))
        return;
    let swept = 0;
    let deleted = 0;
    try {
        const entries = await promises_1.default.readdir(config_1.UPLOAD_DIR);
        const now = Date.now();
        // Process entries concurrently for faster cleanup
        const results = await Promise.allSettled(entries.map(async (entry) => {
            const entryPath = path_1.default.join(config_1.UPLOAD_DIR, entry);
            try {
                const stats = await promises_1.default.stat(entryPath);
                // Use birthtime (creation time) as the age anchor.
                // Fall back to mtime if birthtimeMs is unavailable (some Linux filesystems).
                const createdAt = stats.birthtimeMs > 0 ? stats.birthtimeMs : stats.mtimeMs;
                const age = now - createdAt;
                if (age > config_1.CLEANUP_AGE_MS) {
                    if (stats.isDirectory()) {
                        await promises_1.default.rm(entryPath, { recursive: true, force: true });
                        console.log(`[Cleanup] Removed session directory: ${entry} (age: ${Math.round(age / 1000)}s)`);
                    }
                    else {
                        // Orphaned top-level file — should not exist in normal operation
                        await promises_1.default.unlink(entryPath);
                        console.log(`[Cleanup] Removed orphaned file: ${entry}`);
                    }
                    return 'deleted';
                }
                return 'kept';
            }
            catch (entryErr) {
                // Log the error but continue sweeping other entries
                console.error(`[Cleanup] Could not process entry "${entry}":`, entryErr.message);
                return 'error';
            }
        }));
        for (const result of results) {
            swept++;
            if (result.status === 'fulfilled' && result.value === 'deleted') {
                deleted++;
            }
        }
    }
    catch (err) {
        console.error('[Cleanup] Failed to read uploads directory:', err.message);
    }
    if (deleted > 0 || swept > 0) {
        console.log(`[Cleanup] Sweep complete — checked: ${swept}, removed: ${deleted}`);
    }
}
