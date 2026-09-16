import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createJstDate,
  diffInJstDays,
  formatDueDate,
  formatReminderDateTime,
  fromDueDateInputValue,
  getDueState,
  jstParts,
  startOfJstDay,
  toDueDateInputValue,
} from './dueDate.ts';

const NOW = new Date('2026-09-15T02:00:00.000Z');

test('JST の日付境界で年月日を取り出す', () => {
  assert.deepEqual(jstParts(new Date('2026-09-14T14:59:59.999Z')), {
    year: 2026,
    month: 9,
    day: 14,
    weekday: 1,
  });
  assert.deepEqual(jstParts(new Date('2026-09-14T15:00:00.000Z')), {
    year: 2026,
    month: 9,
    day: 15,
    weekday: 2,
  });
});

test('createJstDate は 00:00 JST の Date を作る', () => {
  assert.equal(createJstDate(2026, 9, 15).toISOString(), '2026-09-14T15:00:00.000Z');
});

test('startOfJstDay はその日の 00:00 JST に丸める', () => {
  assert.equal(startOfJstDay(NOW).toISOString(), '2026-09-14T15:00:00.000Z');
  assert.equal(
    startOfJstDay(new Date('2026-09-15T14:59:00.000Z')).toISOString(),
    '2026-09-14T15:00:00.000Z',
  );
});

test('日付差は時刻ではなく JST の日単位で数える', () => {
  assert.equal(diffInJstDays(createJstDate(2026, 9, 15), NOW), 0);
  assert.equal(diffInJstDays(createJstDate(2026, 9, 16), NOW), 1);
  assert.equal(diffInJstDays(createJstDate(2026, 9, 14), NOW), -1);
  assert.equal(diffInJstDays(createJstDate(2026, 12, 31), NOW), 107);
});

test('UTC 深夜でも JST の「今日」が正しく判定される', () => {
  const lateNightUtc = new Date('2026-09-15T16:30:00.000Z');
  assert.equal(getDueState(createJstDate(2026, 9, 16), lateNightUtc), 'today');
  assert.equal(getDueState(createJstDate(2026, 9, 15), lateNightUtc), 'overdue');
});

test('期限の状態を4種に振り分ける', () => {
  assert.equal(getDueState(null, NOW), 'none');
  assert.equal(getDueState(createJstDate(2026, 9, 10), NOW), 'overdue');
  assert.equal(getDueState(createJstDate(2026, 9, 15), NOW), 'today');
  assert.equal(getDueState(createJstDate(2026, 9, 16), NOW), 'upcoming');
});

test('期限の表示文言が設計書§5.3の表どおりになる', () => {
  assert.equal(formatDueDate(null, NOW), '');
  assert.equal(formatDueDate(createJstDate(2026, 9, 14), NOW), '昨日');
  assert.equal(formatDueDate(createJstDate(2026, 9, 3), NOW), '9月3日');
  assert.equal(formatDueDate(createJstDate(2026, 9, 15), NOW), '今日');
  assert.equal(formatDueDate(createJstDate(2026, 9, 16), NOW), '明日');
  assert.equal(formatDueDate(createJstDate(2026, 9, 12), NOW), '9月12日');
  assert.equal(formatDueDate(createJstDate(2027, 1, 3), NOW), '2027年1月3日');
  assert.equal(formatDueDate(createJstDate(2025, 12, 30), NOW), '2025年12月30日');
});

test('リマインダーは JST の時刻で整形する', () => {
  assert.equal(formatReminderDateTime(new Date('2026-09-15T00:05:00.000Z')), '9月15日 09:05');
});

test('date input との相互変換が JST で往復する', () => {
  assert.equal(toDueDateInputValue(createJstDate(2026, 9, 5)), '2026-09-05');
  assert.equal(toDueDateInputValue(null), '');
  assert.equal(
    fromDueDateInputValue('2026-09-05')?.toISOString(),
    createJstDate(2026, 9, 5).toISOString(),
  );
  assert.equal(fromDueDateInputValue(''), null);
});
