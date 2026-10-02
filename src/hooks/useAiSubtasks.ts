'use client';

import { Schema } from 'firebase/ai';
import { useCallback, useEffect, useState } from 'react';

import { generateWithFallback } from '@/lib/ai/generateWithFallback';
import {
  buildSubtaskPrompt,
  MAX_SUGGESTIONS,
  MIN_SUGGESTIONS,
  parseSubtaskSuggestions,
  SUBTASK_SYSTEM_INSTRUCTION,
  type SubtaskPromptInput,
} from '@/lib/ai/subtaskPrompt';

const TIMEOUT_MS = 10_000;

const responseSchema = Schema.object({
  properties: {
    subtasks: Schema.array({
      items: Schema.string(),
      minItems: MIN_SUGGESTIONS,
      maxItems: MAX_SUGGESTIONS,
    }),
  },
});

export type AiSubtaskState =
  | { phase: 'loading' }
  | { phase: 'success'; suggestions: string[] }
  | { phase: 'error' };

export function useAiSubtasks(input: SubtaskPromptInput): {
  state: AiSubtaskState;
  retry: () => void;
} {
  const [request] = useState(input);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AiSubtaskState>({ phase: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    generateWithFallback({
      systemInstruction: SUBTASK_SYSTEM_INSTRUCTION,
      prompt: buildSubtaskPrompt(request),
      schema: responseSchema,
      parse: (text) => parseSubtaskSuggestions(text, request.existing),
      signal: controller.signal,
      timeoutMs: TIMEOUT_MS,
    }).then(
      (suggestions) => {
        if (!controller.signal.aborted) setState({ phase: 'success', suggestions });
      },
      () => {
        if (!controller.signal.aborted) setState({ phase: 'error' });
      },
    );
    return () => controller.abort();
  }, [request, attempt]);

  const retry = useCallback(() => {
    setState({ phase: 'loading' });
    setAttempt((current) => current + 1);
  }, []);

  return { state, retry };
}
