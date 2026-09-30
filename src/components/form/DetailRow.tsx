'use client';

import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value?: string;
  valueNode?: ReactNode;
  isEmpty?: boolean;
  control?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function DetailRow({
  icon,
  label,
  value,
  valueNode,
  isEmpty = false,
  control,
  onClick,
  disabled = false,
}: DetailRowProps) {
  const content = (
    <>
      <span className="shrink-0 text-base-600">{icon}</span>
      <span className="flex-1 truncate text-left text-body text-fg">{label}</span>
      {control ?? (
        <>
          <span
            className={`flex min-w-0 items-center gap-1.5 truncate text-body ${
              isEmpty ? 'text-fg-tertiary' : 'font-medium text-fg'
            }`}
          >
            {valueNode ?? value}
          </span>
          {onClick && !disabled && (
            <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" className="shrink-0 text-fg-tertiary" />
          )}
        </>
      )}
    </>
  );

  const className =
    'flex h-13 w-full items-center gap-3 border-b border-border px-4 last:border-b-0 disabled:opacity-50';

  if (control || !onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${className} text-left`}>
      {content}
    </button>
  );
}
