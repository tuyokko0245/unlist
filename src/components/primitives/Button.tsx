import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-base-300 text-on-base shadow-fab hover:bg-base-400 active:bg-base-500 disabled-idle:bg-base-200 disabled-idle:text-fg-tertiary disabled-idle:shadow-none',
  secondary:
    'border border-base-300 text-base-700 hover:bg-chip disabled-idle:border-border disabled-idle:text-fg-tertiary',
  ghost: 'text-fg hover:bg-chip disabled-idle:text-fg-tertiary',
  danger: 'bg-danger text-fg-inverse hover:opacity-90 disabled-idle:opacity-40',
  'danger-outline':
    'border border-danger text-danger hover:bg-danger-bg disabled-idle:opacity-40',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 gap-1.5 text-meta font-bold',
  md: 'h-11 px-5 gap-2 text-button',
  lg: 'h-13 px-6 gap-2 text-h3',
};

const SPINNER_SIZE: Record<ButtonSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  success = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  children,
}: ButtonProps) {
  const busy = loading || success;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={loading || undefined}
      data-busy={busy || undefined}
      className={[
        'relative inline-flex select-none items-center justify-center rounded-md',
        'transition-[background-color,transform,opacity] duration-100 ease-out-soft',
        'enabled:active:scale-[0.97] enabled:active:opacity-80',
        'disabled-idle:cursor-not-allowed data-busy:cursor-progress',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      <span className={`inline-flex items-center gap-[inherit] ${busy ? 'invisible' : ''}`}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
      {loading && !success && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={SPINNER_SIZE[size]} label="処理中" />
        </span>
      )}
      {success && (
        <span className="absolute inset-0 flex items-center justify-center" role="status" aria-label="完了">
          <Check size={SPINNER_SIZE[size]} strokeWidth={3} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}
