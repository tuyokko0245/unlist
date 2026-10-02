import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SettingRowProps {
  label: string;
  value?: string;
  control?: ReactNode;
  onClick?: () => void;
}

export function SettingRow({ label, value, control, onClick }: SettingRowProps) {
  const content = (
    <>
      <span className="shrink-0 text-body text-fg">{label}</span>
      {value !== undefined && (
        <span className="min-w-0 flex-1 text-right text-body break-all text-fg-secondary">{value}</span>
      )}
      {control}
      {onClick && <ChevronRight size={20} aria-hidden="true" className="ml-auto shrink-0 text-fg-tertiary" />}
    </>
  );

  const className = 'flex min-h-15 w-full items-center justify-between gap-3 px-4 py-3 text-left';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} rounded-card hover:bg-chip`}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
