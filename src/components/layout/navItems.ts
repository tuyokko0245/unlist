export type TabKey = 'today' | 'tasks' | 'settings';

export const TAB_ITEMS: { key: TabKey; label: string; href: string }[] = [
  { key: 'today', label: '今日', href: '/today' },
  { key: 'tasks', label: 'タスク', href: '/tasks' },
  { key: 'settings', label: '設定', href: '/settings' },
];
