import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const audioDir = path.join(process.cwd(), 'transcribed_audio');

    if (!fs.existsSync(audioDir)) {
      res.status(200).json({ message: '既にファイルは存在しません。' });
      return;
    }

    const files = fs.readdirSync(audioDir);

    if (files.length === 0) {
      res.status(200).json({ message: '削除するファイルがありません。' });
      return;
    }

    for (const file of files) {
      const filePath = path.join(audioDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    }

    res.status(200).json({ message: 'すべての音声ファイルとテキストファイルを削除しました。' });
  } catch (error: any) {
    console.error('Error clearing files:', error);
    res.status(500).json({ error: error.message || 'ファイルの削除中にエラーが発生しました。' });
  }
}