import type { ReactNode } from 'react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  sticky?: boolean;
}

export function Header({ title, subtitle, left, right, sticky = true }: HeaderProps) {
  return (
    <header
      className={`app-header flex h-header shrink-0 items-center gap-2 px-4 md:px-8 ${
        sticky ? 'sticky top-0 z-30' : ''
      }`}
    >
      {left}
      <h1 className="min-w-0 flex-1 truncate text-h1 text-fg">{title}</h1>
      {subtitle && (
        <span className="shrink-0 rounded-md bg-chip px-3 py-1 text-meta font-bold text-base-700">
          {subtitle}
        </span>
      )}
      {right}
    </header>
  );
}
