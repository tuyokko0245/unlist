'use client';

import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';

import { Checkbox } from '@/components/primitives/Checkbox';
import { createTempId, type SubtaskDraft } from '@/lib/task/subtaskDiff';
import { MAX_SUBTASK_TITLE } from '@/types/domain';

export interface SubtaskEditorProps {
  subtasks: SubtaskDraft[];
  onChange: (next: SubtaskDraft[]) => void;
  onRequestAi?: () => void;
  aiDisabled?: boolean;
}

export function SubtaskEditor({ subtasks, onChange, onRequestAi, aiDisabled = true }: SubtaskEditorProps) {
  const [draftTitle, setDraftTitle] = useState('');
  const seed = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const title = draftTitle.trim();
    if (!title) return;
    seed.current += 1;
    onChange([
      ...subtasks,
      { id: createTempId(seed.current), title, isCompleted: false, order: subtasks.length },
    ]);
    setDraftTitle('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    add();
  };

  const update = (id: string, patch: Partial<SubtaskDraft>) => {
    onChange(subtasks.map((subtask) => (subtask.id === id ? { ...subtask, ...patch } : subtask)));
  };

  const remove = (id: string) => {
    onChange(subtasks.filter((subtask) => subtask.id !== id));
  };

  return (
    <div className="flex flex-col">
      {subtasks.length > 0 && (
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex min-h-13 items-center gap-3 border-b border-border py-2 pr-2 pl-4 last:border-b-0"
            >
              <Checkbox
                id={`subtask-${subtask.id}`}
                checked={subtask.isCompleted}
                label={`${subtask.title}を完了にする`}
                onChange={(checked) => update(subtask.id, { isCompleted: checked })}
              />
              <input
                value={subtask.title}
                maxLength={MAX_SUBTASK_TITLE}
                aria-label="サブタスクのタイトル"
                onChange={(event) => update(subtask.id, { title: event.target.value })}
                className={`min-w-0 flex-1 bg-transparent text-body outline-none ${
                  subtask.isCompleted ? 'text-fg-done line-through' : 'text-fg'
                }`}
              />
              <button
                type="button"
                aria-label={`${subtask.title}を削除`}
                onClick={() => remove(subtask.id)}
                className="flex size-tap-min shrink-0 items-center justify-center rounded-md text-danger"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex h-12 items-center gap-2.5 rounded-md border border-border bg-input px-3.5">
        <Plus size={18} strokeWidth={2.2} aria-hidden="true" className="shrink-0 text-base-600" />
        <input
          ref={inputRef}
          id="subtask-new"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={add}
          maxLength={MAX_SUBTASK_TITLE}
          placeholder="サブタスクを追加..."
          aria-label="サブタスクを追加"
          className="min-w-0 flex-1 bg-transparent text-body text-fg outline-none placeholder:text-fg-placeholder"
        />
      </div>

      <button
        type="button"
        disabled={aiDisabled}
        onClick={onRequestAi}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-base-100 text-button text-base-700 disabled:opacity-50"
      >
        <Sparkles size={18} aria-hidden="true" />
        AIにサブタスクを提案してもらう
      </button>
    </div>
  );
}
