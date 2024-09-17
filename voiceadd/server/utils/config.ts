import fs from 'fs';
import path from 'path';

export const getConfig = (filename: string): string => {
  try {
    const filePath = path.join(process.cwd(), 'config', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return data.trim();
  } catch (error) {
    throw new Error(`${filename} の読み込みに失敗しました: ${(error as Error).message}`);
  }
};

export const saveConfig = (filename: string, content: string): void => {
  try {
    const filePath = path.join(process.cwd(), 'config', filename);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`${filename} の保存に失敗しました: ${(error as Error).message}`);
  }
};