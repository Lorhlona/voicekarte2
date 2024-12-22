import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfig, saveConfig } from '../../server/utils/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (typeof filename !== 'string') {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const data = getConfig(filename);
      res.status(200).json({ content: data });
    } else if (req.method === 'POST') {
      const content = req.body.content;
      saveConfig(filename, content);
      res.status(200).json({ message: '設定を保存しました。' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: `${filename} の読み込み/保存に失敗しました` });
  }
}