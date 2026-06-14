"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const config_1 = require("../config");
// Ensure upload directory exists
if (!fs_1.default.existsSync(config_1.UPLOAD_DIR)) {
    fs_1.default.mkdirSync(config_1.UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // We group uploads of a single request into a unique folder
        const uploadId = req.body.uploadId || (0, uuid_1.v4)();
        req.body.uploadId = uploadId; // preserve for routes to access
        const userUploadDir = path_1.default.join(config_1.UPLOAD_DIR, uploadId);
        if (!fs_1.default.existsSync(userUploadDir)) {
            fs_1.default.mkdirSync(userUploadDir, { recursive: true });
        }
        cb(null, userUploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique name keeping original extension
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `${(0, uuid_1.v4)()}${ext}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = file.mimetype === 'application/pdf';
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed!'));
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: config_1.MAX_FILE_SIZE },
    fileFilter: fileFilter
});
