import { getDueState } from '@/lib/date/dueDate';
import type { List, Priority, Task, TaskView } from '@/types/domain';

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export const PRIORITY_LABEL: Record<Priority, string> = { high: '高', medium: '中', low: '低' };

export interface TodayGroups {
  overdue: TaskView[];
  today: TaskView[];
  starred: TaskView[];
  completed: TaskView[];
}

export function buildTaskView(
  task: Task,
  list: Pick<List, 'id' | 'name' | 'color'> | undefined,
  now: Date,
  subtaskCount: { done: number; total: number } = { done: 0, total: 0 },
): TaskView {
  return {
    ...task,
    list: list ?? { id: task.listId, name: '', color: '' },
    dueState: getDueState(task.dueDate, now),
    subtaskCount,
  };
}

export function byCreatedAt(a: TaskView, b: TaskView): number {
  return a.createdAt.getTime() - b.createdAt.getTime();
}

export function byPriority(a: TaskView, b: TaskView): number {
  return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
}

export function byDueDateAsc(a: TaskView, b: TaskView): number {
  const left = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  const right = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  return left - right;
}

export function compareOverdue(a: TaskView, b: TaskView): number {
  return byDueDateAsc(a, b) || byPriority(a, b) || byCreatedAt(a, b);
}

export function compareByPriority(a: TaskView, b: TaskView): number {
  return byPriority(a, b) || byDueDateAsc(a, b) || byCreatedAt(a, b);
}

export function compareCompleted(a: TaskView, b: TaskView): number {
  const left = a.completedAt?.getTime() ?? 0;
  const right = b.completedAt?.getTime() ?? 0;
  return right - left;
}

export function groupTodayTasks(views: TaskView[]): TodayGroups {
  const groups: TodayGroups = { overdue: [], today: [], starred: [], completed: [] };

  for (const view of views) {
    if (view.status === 'completed') {
      groups.completed.push(view);
    } else if (view.dueState === 'overdue') {
      groups.overdue.push(view);
    } else if (view.dueState === 'today') {
      groups.today.push(view);
    } else if (view.isStarred) {
      groups.starred.push(view);
    }
  }

  groups.overdue.sort(compareOverdue);
  groups.today.sort(compareByPriority);
  groups.starred.sort(compareByPriority);
  groups.completed.sort(compareCompleted);

  return groups;
}

export function countTodo(groups: TodayGroups): number {
  return groups.overdue.length + groups.today.length + groups.starred.length;
}

export function taskAriaLabel(task: TaskView, dueText: string): string {
  const parts = [task.title, `優先度${PRIORITY_LABEL[task.priority]}`];
  if (dueText) parts.push(`期限${dueText}`);
  if (task.list.name) parts.push(`リスト${task.list.name}`);
  if (task.isStarred) parts.push('スター付き');
  if (task.status === 'completed') parts.push('完了済み');
  return parts.join('、');
}
