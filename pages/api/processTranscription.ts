// voiceadd/pages/api/processTranscription.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

interface Segment {
  start: number;
  end: number;
  text: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { transcriptPath, apiKey } = req.body;

  if (!transcriptPath || !apiKey) {
    res.status(400).json({ error: '必要なパラメータが不足しています。' });
    return;
  }

  try {
    const transcriptionText = fs.readFileSync(transcriptPath, 'utf8');
    const lines = transcriptionText.split('\n');

    let processedText = '';

    const openai = new OpenAI({ apiKey });

    for (const line of lines) {
      // タイムスタンプとテキストを分割
      const match = line.match(/\[(.*?) ===> (.*?)\] (.*)/);
      if (match) {
        const [, start, end, text] = match;
        const prompt = `以下の音声の部分を要約してください。\n開始時刻: ${start}\n終了時刻: ${end}\n内容: ${text}`;
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3,
        });

        const summary = response.choices[0].message?.content?.trim() || '';
        processedText += `${start} - ${end}: ${summary}\n`;
      }
    }

    res.status(200).json({ processedText });
  } catch (error: any) {
    console.error('Error processing transcription:', error);
    res.status(500).json({ error: error.message || 'トランスクリプションの処理中にエラーが発生しました。' });
  }
}