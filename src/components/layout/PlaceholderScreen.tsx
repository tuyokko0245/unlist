'use client';

import { AppShell } from '@/components/layout/AppShell';
import type { TabKey } from '@/components/layout/navItems';

export function PlaceholderScreen({
  title,
  note,
  activeTab,
}: {
  title: string;
  note: string;
  activeTab?: TabKey;
}) {
  return (
    <AppShell header={{ title }} activeTab={activeTab} showFab={false}>
      <p className="mx-auto w-full max-w-content-max px-4 pt-4 text-body text-fg-secondary md:px-8">
        {note}
      </p>
    </AppShell>
  );
}
