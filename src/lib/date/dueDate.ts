export type DueState = 'overdue' | 'today' | 'upcoming' | 'none';

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface JstParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

export function jstDayIndex(date: Date): number {
  return Math.floor((date.getTime() + JST_OFFSET_MS) / DAY_MS);
}

export function jstParts(date: Date): JstParts {
  const shifted = new Date(date.getTime() + JST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

export function createJstDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day) - JST_OFFSET_MS);
}

export function startOfJstDay(date: Date): Date {
  return new Date(jstDayIndex(date) * DAY_MS - JST_OFFSET_MS);
}

export function diffInJstDays(target: Date, from: Date): number {
  return jstDayIndex(target) - jstDayIndex(from);
}

export function getDueState(dueDate: Date | null, now: Date = new Date()): DueState {
  if (!dueDate) return 'none';
  const diff = diffInJstDays(dueDate, now);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return 'upcoming';
}

export function isOverdue(dueDate: Date | null, now: Date = new Date()): boolean {
  return getDueState(dueDate, now) === 'overdue';
}

export function formatJstDate(date: Date, withYear: boolean): string {
  const { year, month, day } = jstParts(date);
  return withYear ? `${year}年${month}月${day}日` : `${month}月${day}日`;
}

export function formatDueDate(dueDate: Date | null, now: Date = new Date()): string {
  if (!dueDate) return '';

  const diff = diffInJstDays(dueDate, now);
  if (diff === -1) return '昨日';
  if (diff === 0) return '今日';
  if (diff === 1) return '明日';

  return formatJstDate(dueDate, jstParts(dueDate).year !== jstParts(now).year);
}

export function formatReminderDateTime(datetime: Date): string {
  const { month, day } = jstParts(datetime);
  const shifted = new Date(datetime.getTime() + JST_OFFSET_MS);
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function toDueDateInputValue(date: Date | null): string {
  if (!date) return '';
  const { year, month, day } = jstParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function fromDueDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return createJstDate(year, month, day);
}
