import test from 'node:test';
import assert from 'node:assert/strict';

import { createJstDate } from '@/lib/date/dueDate';

import { buildMorningMessage, morningRange, type DueTask } from './morning.ts';
import { buildReminderMessage, isInvalidTokenError, isReminderDue, reminderRange } from './reminders.ts';

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(createJstDate(y, m, d).getTime() + (h * 60 + min) * 60 * 1000);
const NOW = at(2026, 10, 5, 8, 10);
const task = (title: string, day: number, priority: DueTask['priority'] = 'medium'): DueTask => ({
  title,
  dueDate: createJstDate(2026, 10, day),
  priority,
});

test('朝の範囲は JST の今日 0:00 から明後日 0:00 まで', () => {
  const { start, end } = morningRange(NOW);
  assert.equal(start.getTime(), createJstDate(2026, 10, 5).getTime());
  assert.equal(end.getTime(), createJstDate(2026, 10, 7).getTime());
});

test('UTC では前日の早朝（JST 8:00）でも JST の今日を基準にする', () => {
  const cronTime = new Date('2026-10-04T23:05:00Z');
  assert.equal(morningRange(cronTime).start.getTime(), createJstDate(2026, 10, 5).getTime());
});

test('今日と明日の件数をタイトルに、タイトルを本文に入れる', () => {
  const message = buildMorningMessage([task('資料を印刷する', 5), task('会議室を予約する', 6)], NOW);
  assert.deepEqual(message, {
    title: '今日のタスク 1件・明日 1件',
    body: '資料を印刷する／会議室を予約する',
    url: '/today',
  });
});

test('今日だけ・明日だけのときは片方だけ書く', () => {
  assert.equal(buildMorningMessage([task('a', 5)], NOW)?.title, '今日のタスク 1件');
  assert.equal(buildMorningMessage([task('b', 6)], NOW)?.title, '明日 1件');
});

test('本文は今日→明日・優先度の高い順に3件まで、残りは「ほか N件」', () => {
  const message = buildMorningMessage(
    [task('明日低', 6, 'low'), task('今日中', 5), task('今日高', 5, 'high'), task('明日高', 6, 'high'), task('今日低', 5, 'low')],
    NOW,
  );
  assert.equal(message?.title, '今日のタスク 3件・明日 2件');
  assert.equal(message?.body, '今日高／今日中／今日低／ほか2件');
});

test('今日・明日のタスクが無ければ送らない（期限切れ・明後日は数えない）', () => {
  assert.equal(buildMorningMessage([], NOW), null);
  assert.equal(buildMorningMessage([task('昨日', 4), task('明後日', 7)], NOW), null);
});

const candidate = (overrides: Partial<Parameters<typeof isReminderDue>[0]> = {}) => ({
  taskId: 't1',
  title: '歯医者に電話する',
  status: 'todo' as const,
  reminder: { datetime: at(2026, 10, 5, 8, 0), isEnabled: true, sentAt: null },
  ...overrides,
});

test('リマインダーは時刻を過ぎていて2時間以内・未送信・有効・未完了なら送る', () => {
  assert.equal(isReminderDue(candidate(), NOW), true);
});

test('まだ時刻前・2時間より前・送信済み・無効・完了済み・リマインダーなしは送らない', () => {
  assert.equal(isReminderDue(candidate({ reminder: { datetime: at(2026, 10, 5, 8, 20), isEnabled: true } }), NOW), false);
  assert.equal(isReminderDue(candidate({ reminder: { datetime: at(2026, 10, 5, 6, 0), isEnabled: true } }), NOW), false);
  assert.equal(isReminderDue(candidate({ reminder: { datetime: at(2026, 10, 5, 8, 0), isEnabled: true, sentAt: NOW } }), NOW), false);
  assert.equal(isReminderDue(candidate({ reminder: { datetime: at(2026, 10, 5, 8, 0), isEnabled: false } }), NOW), false);
  assert.equal(isReminderDue(candidate({ status: 'completed' }), NOW), false);
  assert.equal(isReminderDue(candidate({ reminder: null }), NOW), false);
});

test('sentAt が無い古いリマインダーも未送信として扱う', () => {
  assert.equal(isReminderDue(candidate({ reminder: { datetime: at(2026, 10, 5, 8, 0), isEnabled: true } }), NOW), true);
});

test('リマインダーの検索範囲は直近2時間', () => {
  const { start, end } = reminderRange(NOW);
  assert.equal(end.getTime() - start.getTime(), 2 * 60 * 60 * 1000);
});

test('リマインダーの通知文はタスク名でタスクを開く', () => {
  assert.deepEqual(buildReminderMessage(candidate()), { title: 'リマインダー', body: '歯医者に電話する', url: '/tasks/t1' });
});

test('無効なトークンのエラーだけを掃除の対象にする', () => {
  assert.equal(isInvalidTokenError('messaging/registration-token-not-registered'), true);
  assert.equal(isInvalidTokenError('messaging/invalid-registration-token'), true);
  assert.equal(isInvalidTokenError('messaging/internal-error'), false);
  assert.equal(isInvalidTokenError(undefined), false);
});
