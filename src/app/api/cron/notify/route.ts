import { buildMorningMessage, morningRange, type DueTask } from '@/lib/notify/morning';
import { adminDb, createReport, deliver, isAuthorized, publicReport } from '@/lib/notify/server';

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const now = new Date();
  const db = adminDb();
  const { start, end } = morningRange(now);
  const report = createReport();

  const settingsSnapshot = await db
    .collectionGroup('settings')
    .where('notificationsEnabled', '==', true)
    .get();

  for (const settings of settingsSnapshot.docs) {
    const uid = settings.ref.parent.parent?.id;
    const tokens: string[] = settings.get('fcmTokens') ?? [];
    if (!uid || settings.id !== 'userSettings' || tokens.length === 0) continue;

    try {
      const tasks = await db
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .where('status', '==', 'todo')
        .where('dueDate', '>=', start)
        .where('dueDate', '<', end)
        .get();
      const due: DueTask[] = tasks.docs.map((task) => ({
        title: task.get('title'),
        dueDate: task.get('dueDate').toDate(),
        priority: task.get('priority'),
      }));
      const message = buildMorningMessage(due, now);
      if (message) await deliver(settings.ref, uid, tokens, { ...message, tag: 'morning' }, report);
    } catch {
      report.failures += 1;
    }
  }

  return Response.json({ ok: true, ...publicReport(report) });
}
