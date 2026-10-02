import { createJstDate, diffInJstDays, jstDayIndex, jstParts, startOfJstDay } from '@/lib/date/dueDate';
import type { ReminderConfig, RepeatConfig } from '@/types/domain';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addJstDays(date: Date, days: number): Date {
  return new Date(startOfJstDay(date).getTime() + days * DAY_MS);
}

function monthlyCandidate(year: number, month: number, monthDay: number): Date {
  return createJstDate(year, month, Math.min(monthDay, daysInMonth(year, month)));
}

export function nextDueDate(repeat: RepeatConfig, completedAt: Date, currentDue: Date | null): Date {
  const base =
    currentDue && jstDayIndex(currentDue) > jstDayIndex(completedAt)
      ? startOfJstDay(currentDue)
      : startOfJstDay(completedAt);

  if (repeat.type === 'weekly' && repeat.weekdays.length > 0) {
    for (let offset = 1; offset <= 7; offset += 1) {
      const candidate = addJstDays(base, offset);
      if (repeat.weekdays.includes(jstParts(candidate).weekday)) return candidate;
    }
  }

  if (repeat.type === 'monthly') {
    const { year, month, day } = jstParts(base);
    const monthDay = repeat.monthDay ?? day;
    const sameMonth = monthlyCandidate(year, month, monthDay);
    if (jstParts(sameMonth).day > day) return sameMonth;
    return month === 12
      ? monthlyCandidate(year + 1, 1, monthDay)
      : monthlyCandidate(year, month + 1, monthDay);
  }

  return addJstDays(base, repeat.type === 'weekly' ? 7 : 1);
}

export function shiftReminder(
  reminder: ReminderConfig,
  currentDue: Date | null,
  nextDue: Date,
): ReminderConfig {
  const anchor = currentDue ?? reminder.datetime;
  const days = diffInJstDays(nextDue, anchor);
  return { ...reminder, datetime: new Date(reminder.datetime.getTime() + days * DAY_MS) };
}

export function isValidRepeat(repeat: RepeatConfig | null): boolean {
  if (!repeat) return true;
  if (repeat.type === 'weekly') return repeat.weekdays.length > 0;
  if (repeat.type === 'monthly') {
    return repeat.monthDay !== null && repeat.monthDay >= 1 && repeat.monthDay <= 31;
  }
  return true;
}

export function formatRepeat(repeat: RepeatConfig | null): string {
  if (!repeat) return 'なし';
  if (repeat.type === 'daily') return '毎日';
  if (repeat.type === 'weekly') {
    const days = [...repeat.weekdays].sort((a, b) => a - b).map((day) => WEEKDAY_LABELS[day]);
    return `毎週（${days.join('・')}）`;
  }
  return `毎月${repeat.monthDay ?? ''}日`;
}
