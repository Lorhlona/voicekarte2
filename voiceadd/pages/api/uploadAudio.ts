import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { IncomingForm, Files } from 'formidable';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest) =>
  new Promise<{ fields: formidable.Fields; files: Files }>((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fields, files } = await parseForm(req);

    // apiKeyがstringかstring[]かをチェックし、文字列を取得
    const apiKey = Array.isArray(fields.apiKey) ? fields.apiKey[0] : fields.apiKey;

    // audioファイルを取得
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    console.log('Received audio file:', audioFile);

    if (!apiKey || typeof apiKey !== 'string') {
      res.status(400).json({ error: '必要なパラメータが不足しています。' });
      return;
    }

    if (!audioFile || !audioFile.filepath) {
      res.status(400).json({ error: '音声ファイルがアップロードされていません。' });
      return;
    }

    // 拡張子を取得してファイルパスに追加
    const originalFilename = Array.isArray(audioFile.originalFilename)
      ? audioFile.originalFilename[0]
      : audioFile.originalFilename;
    const fileExt = path.extname(originalFilename);
    const filePathWithExt = `${audioFile.filepath}${fileExt}`;

    // ファイルをリネームして拡張子を追加
    fs.renameSync(audioFile.filepath, filePathWithExt);

    const openai = new OpenAI({ apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePathWithExt),
      model: 'whisper-1',
      language: 'ja',
      response_format: 'text',
    });

    res.status(200).json({ transcript: transcription.text });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || '内部サーバーエラーが発生しました。' });
  }
}