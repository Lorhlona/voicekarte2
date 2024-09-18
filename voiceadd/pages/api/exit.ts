import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.status(200).json({ message: 'サーバーを終了します...' });
  process.exit();
}