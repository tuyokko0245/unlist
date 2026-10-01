import type { List } from '@/types/domain';

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function orderUpdates(ordered: Pick<List, 'id' | 'order'>[]): { id: string; order: number }[] {
  const updates: { id: string; order: number }[] = [];
  ordered.forEach((list, index) => {
    if (list.order !== index) updates.push({ id: list.id, order: index });
  });
  return updates;
}

export function nextListOrder(lists: Pick<List, 'order'>[]): number {
  return lists.reduce((max, list) => Math.max(max, list.order), -1) + 1;
}

export function canDeleteList(list: Pick<List, 'isDefault'>): boolean {
  return !list.isDefault;
}

export function canRenameList(list: Pick<List, 'isDefault'>): boolean {
  return !list.isDefault;
}
