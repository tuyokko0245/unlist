import { diffInJstDays, startOfJstDay } from '@/lib/date/dueDate';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TITLES = 3;

export interface DueTask {
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface PushMessage {
  title: string;
  body: string;
  url: string;
}

export function morningRange(now: Date): { start: Date; end: Date } {
  const start = startOfJstDay(now);
  return { start, end: new Date(start.getTime() + 2 * DAY_MS) };
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function buildMorningMessage(tasks: DueTask[], now: Date): PushMessage | null {
  const today = tasks.filter((task) => diffInJstDays(task.dueDate, now) === 0);
  const tomorrow = tasks.filter((task) => diffInJstDays(task.dueDate, now) === 1);
  if (today.length === 0 && tomorrow.length === 0) return null;

  const parts = [];
  if (today.length) parts.push(`今日のタスク ${today.length}件`);
  if (tomorrow.length) parts.push(`明日 ${tomorrow.length}件`);

  const ordered = [...today, ...tomorrow].sort((a, b) => {
    const day = diffInJstDays(a.dueDate, now) - diffInJstDays(b.dueDate, now);
    return day !== 0 ? day : PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
  const shown = ordered.slice(0, MAX_TITLES).map((task) => task.title);
  const rest = ordered.length - shown.length;

  return {
    title: parts.join('・'),
    body: rest > 0 ? `${shown.join('／')}／ほか${rest}件` : shown.join('／'),
    url: '/today',
  };
}
