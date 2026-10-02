import { getGenerativeModel, type ObjectSchema } from 'firebase/ai';

import { isRetryableAiError } from '@/lib/ai/subtaskPrompt';
import { ai } from '@/lib/firebase/config';

const BASE_OUTPUT_TOKENS = 1024;
const THINKING_EXTRA_TOKENS = 8192;

const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-2.5-pro',
] as const;

export class AiTimeoutError extends Error {
  constructor() {
    super('AI の応答がタイムアウトしました');
    this.name = 'AiTimeoutError';
  }
}

export interface GenerateOptions<T> {
  systemInstruction: string;
  prompt: string;
  schema: ObjectSchema;
  parse: (text: string) => T;
  signal: AbortSignal;
  timeoutMs: number;
}

export async function generateWithFallback<T>({
  systemInstruction,
  prompt,
  schema,
  parse,
  signal,
  timeoutMs,
}: GenerateOptions<T>): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown = new AiTimeoutError();

  for (const model of FALLBACK_MODELS) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new AiTimeoutError();
    signal.throwIfAborted();

    try {
      const generativeModel = getGenerativeModel(ai, {
        model,
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          maxOutputTokens: BASE_OUTPUT_TOKENS + THINKING_EXTRA_TOKENS,
        },
      });
      const result = await generativeModel.generateContent(prompt, { signal, timeout: remaining });
      return parse(result.response.text());
    } catch (error) {
      if (signal.aborted) throw error;
      if (Date.now() >= deadline) throw new AiTimeoutError();
      if (!isRetryableAiError(error)) throw error;
      lastError = error;
    }
  }

  throw lastError;
}
