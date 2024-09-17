import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { apiKey, transcript, prompt } = req.body;

  if (!apiKey || !transcript || !prompt) {
    res.status(400).json({ error: '必要なパラメータが不足しています。' });
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });

    const messages = [
      { role: 'system', content: prompt } as const,
      { role: 'user', content: transcript } as const,
    ];

    const gptResponse = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages,
      max_tokens: 128000,
      temperature: 0.3,
    });

    const content = gptResponse.choices[0].message?.content?.trim() || '';
    res.status(200).json({ content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}