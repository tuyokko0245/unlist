'use client';

import Link from 'next/link';
import { ListChecks, Settings, Sun } from 'lucide-react';

import { TAB_ITEMS, type TabKey } from './navItems';

const ICONS = {
  today: Sun,
  tasks: ListChecks,
  settings: Settings,
};

export interface BottomTabBarProps {
  active: TabKey;
  todayCount: number;
}

export function BottomTabBar({ active, todayCount }: BottomTabBarProps) {
  return (
    <nav
      role="tablist"
      aria-label="メインナビゲーション"
      className="app-bar app-tabbar fixed inset-x-0 bottom-0 z-35 flex h-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))] items-start pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {TAB_ITEMS.map((item) => {
        const Icon = ICONS[item.key];
        const isActive = item.key === active;
        const badge = item.key === 'today' ? todayCount : 0;

        return (
          <Link
            key={item.key}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            prefetch
            className="flex h-tabbar flex-1 items-center justify-center"
          >
            <span
              className={`relative flex h-11 flex-col items-center justify-center gap-[1px] rounded-[22px] px-5 transition-colors duration-150 ${
                isActive ? 'bg-base-300 text-on-base' : 'text-fg-tertiary'
              }`}
            >
              <Icon size={24} aria-hidden="true" />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1.5 flex size-[18px] items-center justify-center rounded-full bg-base-600 text-badge text-fg-inverse">
                  {badge}
                </span>
              )}
              <span className={`text-tab leading-none ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
