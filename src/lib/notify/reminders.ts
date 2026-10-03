import type { PushMessage } from '@/lib/notify/morning';

export const REMINDER_LOOKBACK_MS = 2 * 60 * 60 * 1000;

export interface ReminderCandidate {
  taskId: string;
  title: string;
  status: 'todo' | 'completed';
  reminder: { datetime: Date; isEnabled: boolean; sentAt?: Date | null } | null;
}

export function reminderRange(now: Date): { start: Date; end: Date } {
  return { start: new Date(now.getTime() - REMINDER_LOOKBACK_MS), end: now };
}

export function isReminderDue(candidate: ReminderCandidate, now: Date): boolean {
  const { reminder } = candidate;
  if (!reminder || !reminder.isEnabled || reminder.sentAt) return false;
  if (candidate.status !== 'todo') return false;
  const at = reminder.datetime.getTime();
  return at <= now.getTime() && at > now.getTime() - REMINDER_LOOKBACK_MS;
}

export function buildReminderMessage(candidate: ReminderCandidate): PushMessage {
  return {
    title: 'リマインダー',
    body: candidate.title,
    url: `/tasks/${candidate.taskId}`,
  };
}

export function isInvalidTokenError(code: string | undefined): boolean {
  return (
    code === 'messaging/registration-token-not-registered' ||
    code === 'messaging/invalid-registration-token' ||
    code === 'messaging/invalid-argument'
  );
}
