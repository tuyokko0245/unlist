import test from 'node:test';
import assert from 'node:assert/strict';

import { createJstDate, jstParts } from '@/lib/date/dueDate';
import type { RepeatConfig } from '@/types/domain';

import { formatRepeat, isValidRepeat, nextDueDate, shiftReminder } from './nextDueDate.ts';

const daily: RepeatConfig = { type: 'daily', weekdays: [], monthDay: null };
const weekly = (weekdays: number[]): RepeatConfig => ({ type: 'weekly', weekdays, monthDay: null });
const monthly = (monthDay: number): RepeatConfig => ({ type: 'monthly', weekdays: [], monthDay });

function jstAt(year: number, month: number, day: number, hours = 12, minutes = 0): Date {
  return new Date(createJstDate(year, month, day).getTime() + (hours * 60 + minutes) * 60 * 1000);
}

function ymd(date: Date): string {
  const { year, month, day } = jstParts(date);
  return `${year}-${month}-${day}`;
}

test('毎日: 9/8 に完了すると 9/9', () => {
  assert.equal(ymd(nextDueDate(daily, jstAt(2026, 9, 8), createJstDate(2026, 9, 8))), '2026-9-9');
});

test('毎週（月・水・金）: 9/8(月) に完了すると 9/10(水)', () => {
  assert.equal(jstParts(createJstDate(2025, 9, 8)).weekday, 1);
  const next = nextDueDate(weekly([1, 3, 5]), jstAt(2025, 9, 8), createJstDate(2025, 9, 8));
  assert.equal(ymd(next), '2025-9-10');
  assert.equal(jstParts(next).weekday, 3);
});

test('毎週（月・水・金）: 9/8(火) に完了すると翌日 9/9(水)', () => {
  assert.equal(jstParts(createJstDate(2026, 9, 8)).weekday, 2);
  const next = nextDueDate(weekly([1, 3, 5]), jstAt(2026, 9, 8), createJstDate(2026, 9, 8));
  assert.equal(ymd(next), '2026-9-9');
});

test('毎週（金のみ）: 金曜に完了すると翌週の金曜', () => {
  assert.equal(ymd(nextDueDate(weekly([5]), jstAt(2026, 9, 11), createJstDate(2026, 9, 11))), '2026-9-18');
});

test('毎週（月のみ）: 9/8(月) に完了すると 9/15(月)', () => {
  assert.equal(jstParts(createJstDate(2025, 9, 8)).weekday, 1);
  const next = nextDueDate(weekly([1]), jstAt(2025, 9, 8), createJstDate(2025, 9, 8));
  assert.equal(ymd(next), '2025-9-15');
});

test('毎月31日: 1/31 に完了すると 2/28（うるう年は 2/29）', () => {
  assert.equal(ymd(nextDueDate(monthly(31), jstAt(2026, 1, 31), createJstDate(2026, 1, 31))), '2026-2-28');
  assert.equal(ymd(nextDueDate(monthly(31), jstAt(2028, 1, 31), createJstDate(2028, 1, 31))), '2028-2-29');
});

test('毎月31日: 3/31 に完了すると 4/30', () => {
  assert.equal(ymd(nextDueDate(monthly(31), jstAt(2026, 3, 31), createJstDate(2026, 3, 31))), '2026-4-30');
});

test('毎月15日: 9/15 に完了すると 10/15', () => {
  assert.equal(ymd(nextDueDate(monthly(15), jstAt(2026, 9, 15), createJstDate(2026, 9, 15))), '2026-10-15');
});

test('毎月31日: 繰り越した 2/28 に完了すると 3/31 に戻る', () => {
  assert.equal(ymd(nextDueDate(monthly(31), jstAt(2026, 2, 28), createJstDate(2026, 2, 28))), '2026-3-31');
});

test('毎月: 12月から翌年1月へ進む', () => {
  assert.equal(ymd(nextDueDate(monthly(20), jstAt(2026, 12, 20), createJstDate(2026, 12, 20))), '2027-1-20');
});

test('毎月: 指定日より前に完了すると同じ月の指定日', () => {
  assert.equal(ymd(nextDueDate(monthly(15), jstAt(2026, 9, 3), null)), '2026-9-15');
});

test('期限より前に完了したときは期限を基準にする', () => {
  assert.equal(ymd(nextDueDate(daily, jstAt(2026, 9, 8), createJstDate(2026, 9, 10))), '2026-9-11');
  assert.equal(
    ymd(nextDueDate(weekly([1, 3, 5]), jstAt(2026, 9, 7), createJstDate(2026, 9, 9))),
    '2026-9-11',
  );
});

test('期限を過ぎてから完了したときは完了日を基準にする', () => {
  assert.equal(ymd(nextDueDate(daily, jstAt(2026, 9, 8), createJstDate(2026, 9, 1))), '2026-9-9');
});

test('期限なしは完了日を基準にする', () => {
  assert.equal(ymd(nextDueDate(daily, jstAt(2026, 9, 8), null)), '2026-9-9');
});

test('JST の日付境界で計算する（UTC では前日の時刻）', () => {
  const lateNight = jstAt(2026, 9, 8, 23, 59);
  assert.equal(lateNight.getUTCDate(), 8);
  assert.equal(ymd(nextDueDate(daily, lateNight, null)), '2026-9-9');

  const earlyMorning = jstAt(2026, 9, 9, 0, 30);
  assert.equal(earlyMorning.getUTCDate(), 8);
  assert.equal(ymd(nextDueDate(daily, earlyMorning, null)), '2026-9-10');
});

test('次回期限は JST の 0:00 になる', () => {
  const next = nextDueDate(daily, jstAt(2026, 9, 8, 18), null);
  assert.equal(next.getTime(), createJstDate(2026, 9, 9).getTime());
});

test('リマインダーは期限からのずれを保って次回期限へ移る', () => {
  const reminder = { datetime: jstAt(2026, 9, 7, 20, 0), isEnabled: true };
  const shifted = shiftReminder(reminder, createJstDate(2026, 9, 8), createJstDate(2026, 9, 10));
  assert.equal(shifted.datetime.getTime(), jstAt(2026, 9, 9, 20, 0).getTime());
  assert.equal(shifted.isEnabled, true);
});

test('期限なしのリマインダーは同じ時刻のまま次回期限の日へ移る', () => {
  const reminder = { datetime: jstAt(2026, 9, 5, 9, 30), isEnabled: true };
  const shifted = shiftReminder(reminder, null, createJstDate(2026, 9, 9));
  assert.equal(shifted.datetime.getTime(), jstAt(2026, 9, 9, 9, 30).getTime());
});

test('繰り返し設定の妥当性', () => {
  assert.equal(isValidRepeat(null), true);
  assert.equal(isValidRepeat(daily), true);
  assert.equal(isValidRepeat(weekly([])), false);
  assert.equal(isValidRepeat(weekly([0])), true);
  assert.equal(isValidRepeat(monthly(31)), true);
  assert.equal(isValidRepeat({ type: 'monthly', weekdays: [], monthDay: null }), false);
});

test('繰り返し設定の表示文字列', () => {
  assert.equal(formatRepeat(null), 'なし');
  assert.equal(formatRepeat(daily), '毎日');
  assert.equal(formatRepeat(weekly([5, 1, 3])), '毎週（月・水・金）');
  assert.equal(formatRepeat(monthly(31)), '毎月31日');
});
