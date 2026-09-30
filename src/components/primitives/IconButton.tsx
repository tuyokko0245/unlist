import type { ReactNode } from 'react';

export interface IconButtonProps {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'filled' | 'danger';
  badge?: number;
  disabled?: boolean;
  className?: string;
  onClick: () => void;
}

const VARIANT_CLASS = {
  ghost: 'text-fg hover:bg-chip',
  filled: 'bg-base-300 text-on-base hover:bg-base-400',
  danger: 'text-danger hover:bg-danger-bg',
};

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  badge,
  disabled = false,
  className = '',
  onClick,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative flex size-tap-min items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-40 ${VARIANT_CLASS[variant]} ${className}`}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1 flex size-[18px] items-center justify-center rounded-full bg-base-600 text-badge text-fg-inverse">
          {badge}
        </span>
      )}
    </button>
  );
}
