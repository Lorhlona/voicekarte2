"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getConfig = (filename) => {
    try {
        const filePath = path_1.default.join(process.cwd(), 'config', filename);
        const data = fs_1.default.readFileSync(filePath, 'utf8');
        return data.trim();
    }
    catch (error) {
        throw new Error(`${filename} の読み込みに失敗しました: ${error.message}`);
    }
};
exports.getConfig = getConfig;
