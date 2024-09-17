import OpenAI from 'openai';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const getOpenAIApi = (apiKey: string) => {
  const openai = new OpenAI({
    apiKey: apiKey,
  });
  return openai;
};

export const uploadAudio = async (audioBlob: Blob, apiKey: string): Promise<string> => {
  const formData = new FormData();
  formData.append('apiKey', apiKey);
  formData.append('audio', audioBlob, 'audio.webm');

  const response = await fetch('/api/uploadAudio', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (response.ok) {
    return data.transcript;
  } else {
    throw new Error(data.error || '音声のアップロードに失敗しました');
  }
};

export const generateMedicalRecord = async (
  transcript: string,
  prompt: string,
  apiKey: string
): Promise<string> => {
  const openai = getOpenAIApi(apiKey);
  const messages: Message[] = [
    { role: 'system', content: prompt },
    { role: 'user', content: transcript },
  ];

  const gptResponse = await openai.chat.completions.create({
    model: 'chatgpt-4o-latest', // 正しいモデル名に修正
    messages,
    max_tokens: 128000,
    temperature: 0.3,
  });

  return gptResponse.choices[0].message?.content?.trim() || '';
};