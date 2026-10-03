import { Timestamp, type DocumentSnapshot } from 'firebase-admin/firestore';

import {
  buildReminderMessage,
  isReminderDue,
  reminderRange,
  type ReminderCandidate,
} from '@/lib/notify/reminders';
import { adminDb, createReport, deliver, isAuthorized, publicReport } from '@/lib/notify/server';

function toCandidate(task: DocumentSnapshot): ReminderCandidate {
  const reminder = task.get('reminder');
  return {
    taskId: task.id,
    title: task.get('title'),
    status: task.get('status'),
    reminder: reminder
      ? {
          datetime: reminder.datetime.toDate(),
          isEnabled: reminder.isEnabled === true,
          sentAt: reminder.sentAt ? reminder.sentAt.toDate() : null,
        }
      : null,
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const now = new Date();
  const db = adminDb();
  const { start, end } = reminderRange(now);
  const report = createReport();
  const settingsCache = new Map<string, DocumentSnapshot>();

  const tasks = await db
    .collectionGroup('tasks')
    .where('reminder.datetime', '>', start)
    .where('reminder.datetime', '<=', end)
    .get();

  for (const task of tasks.docs) {
    const uid = task.ref.parent.parent?.id;
    const candidate = toCandidate(task);
    if (!uid || !isReminderDue(candidate, now)) continue;

    try {
      let settings = settingsCache.get(uid);
      if (!settings) {
        settings = await db.collection('users').doc(uid).collection('settings').doc('userSettings').get();
        settingsCache.set(uid, settings);
      }
      const enabled = settings.get('notificationsEnabled') === true;
      const tokens: string[] = settings.get('fcmTokens') ?? [];

      const delivered =
        enabled && tokens.length > 0
          ? await deliver(settings.ref, uid, tokens, { ...buildReminderMessage(candidate), tag: `reminder-${task.id}` }, report)
          : false;

      if (delivered || !enabled || tokens.length === 0) {
        await task.ref.update({ 'reminder.sentAt': Timestamp.fromDate(now) });
      }
    } catch {
      report.failures += 1;
    }
  }

  return Response.json({ ok: true, checked: tasks.size, ...publicReport(report) });
}
