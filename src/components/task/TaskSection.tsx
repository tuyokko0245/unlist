import type { ReactNode } from 'react';

export interface TaskSectionProps {
  title: string;
  count: number;
  tone?: 'danger' | 'default';
  hideWhenEmpty?: boolean;
  children: ReactNode;
}

export function TaskSection({
  title,
  count,
  tone = 'default',
  hideWhenEmpty = true,
  children,
}: TaskSectionProps) {
  if (hideWhenEmpty && count === 0) return null;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="sticky top-header z-10 flex items-center gap-2 py-1">
        <h2
          className={`flex h-7 shrink-0 items-center rounded-md px-3 text-[15px] font-bold ${
            tone === 'danger' ? 'bg-priority-high-bg text-danger' : 'bg-chip text-base-700'
          }`}
        >
          {title} ({count}件)
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
