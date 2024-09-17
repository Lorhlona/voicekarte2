import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import OpenAI from 'openai';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      res.status(500).json({ error: 'ファイルのアップロードに失敗しました。' });
      return;
    }

    // apiKeyがstringかstring[]かをチェックし、文字列を取得
    const apiKey = Array.isArray(fields.apiKey)
      ? fields.apiKey[0]
      : fields.apiKey;

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

    try {
      const openai = new OpenAI({ apiKey });

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFile.filepath),
        model: 'whisper-1',
        language: 'ja',
        response_format: 'text',
      });

      res.status(200).json({ transcript: transcription.text });
    } catch (error: any) {
      console.error('OpenAI transcription error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}