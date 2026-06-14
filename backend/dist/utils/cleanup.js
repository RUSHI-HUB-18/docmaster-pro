"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCleanup = runCleanup;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
function runCleanup() {
    console.log('[Cleanup] Starting sweep of upload directory...');
    if (!fs_1.default.existsSync(config_1.UPLOAD_DIR)) {
        return;
    }
    try {
        const files = fs_1.default.readdirSync(config_1.UPLOAD_DIR);
        const now = Date.now();
        for (const file of files) {
            const filePath = path_1.default.join(config_1.UPLOAD_DIR, file);
            try {
                const stats = fs_1.default.statSync(filePath);
                const age = now - stats.mtimeMs;
                if (age > config_1.CLEANUP_AGE_MS) {
                    // Delete file or folder recursively
                    if (stats.isDirectory()) {
                        fs_1.default.rmSync(filePath, { recursive: true, force: true });
                        console.log(`[Cleanup] Deleted directory: ${file}`);
                    }
                    else {
                        fs_1.default.unlinkSync(filePath);
                        console.log(`[Cleanup] Deleted file: ${file}`);
                    }
                }
            }
            catch (fileErr) {
                console.error(`[Cleanup] Error processing ${file}:`, fileErr);
            }
        }
    }
    catch (err) {
        console.error('[Cleanup] Error reading uploads directory:', err);
    }
}
