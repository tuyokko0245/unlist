'use client';

import { useEffect, useRef } from 'react';

import { FieldError } from './FieldError';

export interface TextareaProps {
  id: string;
  label: string;
  visuallyHiddenLabel?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showCounter?: boolean;
  error?: string;
  minRows?: number;
  maxRows?: number;
  autoExpand?: boolean;
}

function counterTone(length: number, max: number): string {
  if (length >= max) return 'text-danger';
  if (length > max * 0.8) return 'text-warning';
  return 'text-fg-tertiary';
}

export function Textarea({
  id,
  label,
  visuallyHiddenLabel = false,
  placeholder,
  value,
  onChange,
  maxLength,
  showCounter,
  error,
  minRows = 4,
  maxRows = 12,
  autoExpand = true,
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const counterVisible = maxLength !== undefined && (showCounter ?? true);
  const errorId = `${id}-error`;
  const counterId = `${id}-count`;

  useEffect(() => {
    const element = ref.current;
    if (!autoExpand || !element) return;
    element.style.height = 'auto';
    const lineHeight = 26;
    const max = maxRows * lineHeight;
    element.style.height = `${Math.min(element.scrollHeight, max)}px`;
    element.style.overflowY = element.scrollHeight > max ? 'auto' : 'hidden';
  }, [value, autoExpand, maxRows]);

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor={id}
        className={visuallyHiddenLabel ? 'sr-only' : 'pl-1 text-meta text-fg-secondary'}
      >
        {label}
      </label>

      <div className="rounded-md border border-border bg-input px-3.5 py-3">
        <textarea
          ref={ref}
          id={id}
          rows={minRows}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error && errorId, counterVisible && counterId].filter(Boolean).join(' ') || undefined}
          className="w-full resize-none bg-transparent text-body text-fg outline-none placeholder:text-fg-placeholder"
        />
        {counterVisible && (
          <p
            id={counterId}
            aria-live="polite"
            className={`text-right text-meta tabular-nums ${counterTone(value.length, maxLength)}`}
          >
            {value.length}/{maxLength}
          </p>
        )}
      </div>

      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}
