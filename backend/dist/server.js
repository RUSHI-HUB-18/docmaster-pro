"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const pdf_1 = __importDefault(require("./routes/pdf"));
const config_1 = require("./config");
const cleanup_1 = require("./utils/cleanup");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // For development flexibility; restrict in production
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// API Routes
app.use('/api/pdf', pdf_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Error] Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'An internal server error occurred.'
    });
});
// Initialize automatic file cleanup timer
setInterval(() => {
    try {
        (0, cleanup_1.runCleanup)();
    }
    catch (err) {
        console.error('Cleanup scheduler error:', err);
    }
}, config_1.CLEANUP_INTERVAL_MS);
// Start server
app.listen(config_1.PORT, () => {
    console.log(`=========================================`);
    console.log(` PDFMaster Pro backend listening on port ${config_1.PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Upload dir: ${require('./config').UPLOAD_DIR}`);
    console.log(`=========================================`);
    // Run an initial sweep on start
    (0, cleanup_1.runCleanup)();
});
