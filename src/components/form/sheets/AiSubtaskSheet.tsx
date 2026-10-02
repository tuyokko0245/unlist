'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { BottomSheet } from '@/components/layout/BottomSheet';
import { Button } from '@/components/primitives/Button';
import { useAiSubtasks } from '@/hooks/useAiSubtasks';
import type { SubtaskPromptInput } from '@/lib/ai/subtaskPrompt';

interface AiSubtaskSheetProps {
  isOpen: boolean;
  input: SubtaskPromptInput;
  onAdd: (titles: string[]) => void;
  onManual: () => void;
  onClose: () => void;
}

function SuggestionList({
  suggestions,
  onAdd,
}: {
  suggestions: string[];
  onAdd: (titles: string[]) => void;
}) {
  const [selected, setSelected] = useState<boolean[]>(() => suggestions.map(() => true));
  const count = selected.filter(Boolean).length;

  return (
    <div className="flex flex-col pb-1">
      <div role="group" aria-label="提案されたサブタスク" className="flex flex-col gap-0.5">
        {suggestions.map((title, index) => {
          const on = selected[index];
          return (
            <button
              key={title}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() =>
                setSelected((current) => current.map((value, i) => (i === index ? !value : value)))
              }
              className={`flex min-h-14 w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors duration-150 ${
                on ? 'bg-chip' : 'hover:bg-base-50'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-[7px] border-2 border-base-300 ${
                  on ? 'bg-base-300' : ''
                }`}
              >
                {on && <Check size={16} strokeWidth={3} className="text-on-base" />}
              </span>
              <span className="flex-1 text-body text-fg">{title}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-3">
        <Button
          size="lg"
          fullWidth
          disabled={count === 0}
          onClick={() => onAdd(suggestions.filter((_, index) => selected[index]))}
        >
          {count === 0 ? '追加するサブタスクを選んでください' : `選択した${count}件を追加`}
        </Button>
      </div>
    </div>
  );
}

function AiSubtaskSheetBody({ input, onAdd, onManual }: Omit<AiSubtaskSheetProps, 'isOpen' | 'onClose'>) {
  const { state, retry } = useAiSubtasks(input);

  if (state.phase === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 px-3 py-10">
        <Loader2
          size={32}
          aria-hidden="true"
          className="animate-spin text-base-600 motion-reduce:animate-none"
        />
        <p aria-live="assertive" className="text-body text-fg-secondary">
          AIがサブタスクを考えています...
        </p>
      </div>
    );
  }

  if (state.phase === 'error') {
    return (
      <div className="flex flex-col gap-3 px-1 pt-4 pb-1">
        <p role="alert" className="text-center text-body font-medium text-fg">
          提案の取得に失敗しました
        </p>
        <p className="text-center text-meta text-fg-tertiary">
          時間をおいて再試行するか、手動で入力してください
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Button size="lg" fullWidth onClick={retry}>
            再試行
          </Button>
          <Button size="lg" variant="secondary" fullWidth onClick={onManual}>
            手動で入力する
          </Button>
        </div>
      </div>
    );
  }

  return <SuggestionList suggestions={state.suggestions} onAdd={onAdd} />;
}

export function AiSubtaskSheet({ isOpen, input, onAdd, onManual, onClose }: AiSubtaskSheetProps) {
  if (!isOpen) return null;

  return (
    <BottomSheet isOpen onClose={onClose} title="AIのサブタスク提案" subtitle={input.title.trim()}>
      <AiSubtaskSheetBody input={input} onAdd={onAdd} onManual={onManual} />
    </BottomSheet>
  );
}
