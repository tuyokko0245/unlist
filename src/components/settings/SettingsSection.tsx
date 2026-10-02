import type { ReactNode } from 'react';

export function SettingsSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <h2 className="section-label w-fit shrink-0">{title}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <div className="rounded-card border border-border bg-surface shadow-sm">{children}</div>
      {note && <div className="px-1 text-meta text-fg-tertiary">{note}</div>}
    </section>
  );
}
