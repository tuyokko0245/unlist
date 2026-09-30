'use client';

import { ListChecks, Plus, Settings, Sun } from 'lucide-react';

import type { List } from '@/types/domain';

export type ActiveView = 'today' | 'all' | { listId: string };

export interface ListNavProps {
  lists: List[];
  counts: Record<string, number>;
  activeView: ActiveView;
  onSelectToday: () => void;
  onSelectAll: () => void;
  onSelectList: (listId: string) => void;
  onCreateList: () => void;
  onManageLists: () => void;
  onOpenSettings?: () => void;
  showSettingsLink?: boolean;
}

function NavRow({
  active = false,
  icon,
  label,
  count,
  accent = false,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  count?: number;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex h-12 w-full items-center gap-2.5 overflow-hidden rounded-card px-3 text-left transition-colors duration-150 ${
        active ? 'bg-chip' : 'hover:bg-base-50'
      }`}
    >
      {active && <span className="absolute inset-y-0 left-0 w-1 bg-base-600" aria-hidden="true" />}
      {icon}
      <span
        className={`flex-1 truncate text-body ${
          active || accent ? 'font-bold text-base-700' : 'text-fg'
        }`}
      >
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span
          className={`flex h-[26px] min-w-[26px] items-center justify-center rounded-[13px] bg-base-100 px-2 text-meta font-bold ${
            active ? 'text-base-700' : 'text-fg-tertiary'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function ListNav({
  lists,
  counts,
  activeView,
  onSelectToday,
  onSelectAll,
  onSelectList,
  onCreateList,
  onManageLists,
  onOpenSettings,
  showSettingsLink = false,
}: ListNavProps) {
  const activeListId = typeof activeView === 'object' ? activeView.listId : null;
  const todayCount = counts.today ?? 0;

  return (
    <nav aria-label="リストナビゲーション" className="flex h-full flex-col gap-0.5 px-3 pt-4 pb-5">
      <div className="flex flex-col gap-0.5">
        <NavRow
          active={activeView === 'today'}
          icon={<Sun size={20} aria-hidden="true" className="text-base-700" />}
          label="今日"
          count={todayCount}
          onClick={onSelectToday}
        />
        <NavRow
          active={activeView === 'all'}
          icon={<ListChecks size={20} aria-hidden="true" className="text-base-600" />}
          label="すべてのタスク"
          onClick={onSelectAll}
        />
      </div>

      <div className="my-3 h-px bg-border" />
      <p className="mb-2 inline-flex h-7 w-fit items-center rounded-md bg-chip px-3 text-[15px] font-bold text-base-700">
        マイリスト
      </p>

      <div className="flex flex-col gap-0.5">
        {lists.map((list) => (
          <NavRow
            key={list.id}
            active={activeListId === list.id}
            icon={
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full"
                style={{ background: list.color }}
              />
            }
            label={list.name}
            count={counts[list.id] ?? 0}
            onClick={() => onSelectList(list.id)}
          />
        ))}
      </div>

      <div className="my-3 h-px bg-border" />

      <div className="flex flex-col gap-0.5">
        <NavRow
          icon={<Plus size={20} aria-hidden="true" className="text-base-700" />}
          label="リストを追加"
          accent
          onClick={onCreateList}
        />
        <NavRow
          icon={<Settings size={20} aria-hidden="true" className="text-base-600" />}
          label="リストを管理"
          onClick={onManageLists}
        />
      </div>

      {showSettingsLink && onOpenSettings && (
        <>
          <div className="flex-1" />
          <NavRow
            icon={<Settings size={20} aria-hidden="true" className="text-base-600" />}
            label="設定"
            onClick={onOpenSettings}
          />
        </>
      )}
    </nav>
  );
}
