'use client';

import { useRouter } from 'next/navigation';

import { AppIcon } from '@/components/auth/AppIcon';
import { ListNav, type ActiveView } from '@/components/layout/ListNav';
import { useLists } from '@/hooks/useLists';

export interface DesktopSidebarProps {
  activeView: ActiveView;
  counts: Record<string, number>;
}

export function DesktopSidebar({ activeView, counts }: DesktopSidebarProps) {
  const { lists } = useLists();
  const router = useRouter();

  return (
    <aside className="app-bar sticky top-0 hidden h-dvh w-sidebar-w shrink-0 flex-col overflow-y-auto border-r border-border md:flex">
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-2">
        <AppIcon size="sm" />
        <span className="text-h2 text-brand">ウンlist</span>
      </div>
      <ListNav
        lists={lists}
        counts={counts}
        activeView={activeView}
        onSelectToday={() => router.push('/today')}
        onSelectAll={() => router.push('/tasks')}
        onSelectList={(listId) => router.push(`/tasks?list=${listId}`)}
        onCreateList={() => router.push('/lists')}
        onManageLists={() => router.push('/lists')}
        onOpenSettings={() => router.push('/settings')}
        showSettingsLink
      />
    </aside>
  );
}
