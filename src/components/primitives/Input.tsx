'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState, type Ref } from 'react';

import { FieldError } from './FieldError';

export interface InputProps {
  id: string;
  label: string;
  visuallyHiddenLabel?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showCounter?: boolean;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password';
  autoFocus?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'email';
  size?: 'md' | 'lg';
  emphasis?: boolean;
  ref?: Ref<HTMLInputElement>;
}

function counterTone(length: number, max: number): string {
  if (length >= max) return 'text-danger';
  if (length > max * 0.8) return 'text-warning';
  return 'text-fg-tertiary';
}

export function Input({
  id,
  label,
  visuallyHiddenLabel = false,
  placeholder,
  value,
  onChange,
  maxLength,
  showCounter,
  error,
  helperText,
  type = 'text',
  autoFocus,
  autoComplete,
  inputMode,
  size = 'lg',
  emphasis = false,
  ref,
}: InputProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const counterVisible = maxLength !== undefined && (showCounter ?? true);

  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const counterId = `${id}-count`;
  const describedBy =
    [error && errorId, helperText && !error && helperId, counterVisible && counterId]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor={id}
        className={visuallyHiddenLabel ? 'sr-only' : 'pl-1 text-meta text-fg-secondary'}
      >
        {label}
      </label>

      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={isPassword && revealed ? 'text' : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'input-field w-full rounded-md border bg-input px-3.5 text-fg',
            emphasis ? 'text-h2' : 'text-body',
            'placeholder:text-fg-placeholder transition-[border-color,box-shadow] duration-150',
            size === 'lg' ? 'h-13' : 'h-11',
            isPassword ? 'pr-13' : '',
            error ? 'border-danger' : 'border-border',
          ].join(' ')}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={revealed ? 'パスワードを隠す' : 'パスワードを表示'}
            aria-pressed={revealed}
            aria-controls={id}
            className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-sm text-base-600"
          >
            {revealed ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
          </button>
        )}
      </div>

      {(error || helperText || counterVisible) && (
        <div className="flex items-start gap-2">
          {error ? (
            <FieldError id={errorId} message={error} />
          ) : helperText ? (
            <p id={helperId} className="flex-1 pl-1 text-meta text-fg-tertiary">
              {helperText}
            </p>
          ) : (
            <span className="flex-1" />
          )}
          {counterVisible && (
            <p
              id={counterId}
              aria-live="polite"
              className={`shrink-0 text-meta tabular-nums ${counterTone(value.length, maxLength)}`}
            >
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
