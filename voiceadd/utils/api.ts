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

// utils/api.ts

export const generateMedicalRecord = async (
  transcript: string,
  prompt: string,
  apiKey: string
): Promise<string> => {
  console.log('Sending to /api/generateRecord:', { apiKey, transcript, prompt }); // 送信内容をログに出力

  const response = await fetch('/api/generateRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey, transcript, prompt }),
  });

  const data = await response.json();

  if (response.ok) {
    return data.content;
  } else {
    throw new Error(data.error || 'カルテの生成に失敗しました');
  }
};