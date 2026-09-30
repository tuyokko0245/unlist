'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { Fab } from '@/components/layout/Fab';
import { Header } from '@/components/layout/Header';
import type { ActiveView } from '@/components/layout/ListNav';
import type { TabKey } from '@/components/layout/navItems';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export interface HeaderConfig {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export interface AppShellProps {
  header: HeaderConfig | null;
  activeTab?: TabKey;
  activeView?: ActiveView;
  counts?: Record<string, number>;
  todayCount?: number;
  showFab?: boolean;
  fabPulse?: boolean;
  fabHref?: string;
  children: ReactNode;
}

export function AppShell({
  header,
  activeTab,
  activeView = 'today',
  counts = {},
  todayCount = 0,
  showFab,
  fabPulse = false,
  fabHref = '/tasks/new',
  children,
}: AppShellProps) {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const fabVisible = showFab ?? activeTab !== undefined;

  return (
    <div className="flex min-h-dvh flex-1">
      {activeTab && <DesktopSidebar activeView={activeView} counts={counts} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner isOffline={!isOnline} />
        {header && <Header {...header} />}
        <div className="flex-1 pb-list-pad-bottom md:pb-24">{children}</div>
      </div>

      {activeTab && <BottomTabBar active={activeTab} todayCount={todayCount} />}
      {fabVisible && <Fab onClick={() => router.push(fabHref)} pulse={fabPulse} />}
    </div>
  );
}
