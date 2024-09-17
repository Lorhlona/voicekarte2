import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { apiKey, transcript, prompt } = req.body;

  if (!apiKey || !transcript || !prompt) {
    res.status(400).json({ error: '必要なパラメータが不足しています。' });
    return;
  }

  const openai = new OpenAI({
    apiKey,
  });
  try {
    type ChatRole = 'assistant' | 'user';

    interface ChatCompletionMessage {
      role: ChatRole;
      content: string;
      refusal?: string;
    }

    const messages: ChatCompletionMessage[] = [
      { role: 'assistant', content: prompt, refusal: '' },
      { role: 'user', content: transcript },
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