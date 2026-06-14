"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLEANUP_INTERVAL_MS = exports.CLEANUP_AGE_MS = exports.MAX_FILE_SIZE = exports.UPLOAD_DIR = exports.PORT = void 0;
const path_1 = __importDefault(require("path"));
exports.PORT = process.env.PORT || 5000;
exports.UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
exports.MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
exports.CLEANUP_AGE_MS = 60 * 60 * 1000; // 1 hour
exports.CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // check every 15 minutes
