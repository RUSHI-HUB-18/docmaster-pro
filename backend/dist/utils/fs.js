"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExists = fileExists;
const promises_1 = __importDefault(require("fs/promises"));
/**
 * Checks whether a path exists using async fs.
 */
async function fileExists(p) {
    try {
        await promises_1.default.access(p);
        return true;
    }
    catch {
        return false;
    }
}
