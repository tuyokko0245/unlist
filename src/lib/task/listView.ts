import { byCreatedAt, byDueDateAsc, byPriority, compareCompleted } from '@/lib/task/todayView';
import type { TaskView } from '@/types/domain';

export type StatusFilter = 'todo' | 'completed' | 'all';

export const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  todo: '未完了',
  completed: '完了',
  all: 'すべて',
};

export const DEFAULT_STATUS_FILTER: StatusFilter = 'todo';

export interface TaskFilter {
  listId: string | null;
  starredOnly: boolean;
}

function byStarred(a: TaskView, b: TaskView): number {
  return Number(b.isStarred) - Number(a.isStarred);
}

export function compareTaskList(a: TaskView, b: TaskView): number {
  return byStarred(a, b) || byPriority(a, b) || byDueDateAsc(a, b) || byCreatedAt(a, b);
}

export function matchesFilter(task: TaskView, filter: TaskFilter): boolean {
  if (filter.listId !== null && task.listId !== filter.listId) return false;
  if (filter.starredOnly && !task.isStarred) return false;
  return true;
}

export function selectTodoTasks(tasks: TaskView[], filter: TaskFilter): TaskView[] {
  return tasks.filter((task) => matchesFilter(task, filter)).sort(compareTaskList);
}

export function selectCompletedTasks(tasks: TaskView[], filter: TaskFilter): TaskView[] {
  return tasks.filter((task) => matchesFilter(task, filter)).sort(compareCompleted);
}

export function countTodoByList(tasks: TaskView[], listIds: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const listId of listIds) counts[listId] = 0;
  for (const task of tasks) counts[task.listId] = (counts[task.listId] ?? 0) + 1;
  return counts;
}

export function insertHeldTasks(
  tasks: TaskView[],
  held: { task: TaskView; index: number }[],
): TaskView[] {
  const rows = [...tasks];
  for (const { task, index } of [...held].sort((a, b) => a.index - b.index)) {
    if (rows.some((row) => row.id === task.id)) continue;
    rows.splice(Math.min(index, rows.length), 0, task);
  }
  return rows;
}
