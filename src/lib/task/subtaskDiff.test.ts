import test from 'node:test';
import assert from 'node:assert/strict';

import {
  countSubtasks,
  createTempId,
  diffSubtasks,
  isTempId,
  toDrafts,
  type SubtaskDraft,
} from '@/lib/task/subtaskDiff';
import type { Subtask } from '@/types/domain';

function existing(id: string, title: string, order: number, isCompleted = false): Subtask {
  return { id, title, isCompleted, order, createdAt: new Date(0) };
}

function draft(id: string, title: string, order: number, isCompleted = false): SubtaskDraft {
  return { id, title, isCompleted, order };
}

test('新規（tmp-）は作成に振り分ける', () => {
  const diff = diffSubtasks([], [draft(createTempId(1), '資料を集める', 0)]);
  assert.equal(diff.creates.length, 1);
  assert.equal(diff.updates.length, 0);
  assert.equal(diff.deletes.length, 0);
  assert.ok(isTempId(diff.creates[0].id));
});

test('変更がなければ何も出さない', () => {
  const initial = [existing('a', 'A', 0), existing('b', 'B', 1)];
  const diff = diffSubtasks(initial, toDrafts(initial));
  assert.deepEqual(diff, { creates: [], updates: [], deletes: [] });
});

test('タイトル・完了状態の変更は更新に入る', () => {
  const initial = [existing('a', 'A', 0), existing('b', 'B', 1)];
  const diff = diffSubtasks(initial, [draft('a', 'A2', 0), draft('b', 'B', 1, true)]);
  assert.deepEqual(diff.updates.map((d) => d.id).sort(), ['a', 'b']);
});

test('並び替えは order の更新として出る', () => {
  const initial = [existing('a', 'A', 0), existing('b', 'B', 1)];
  const diff = diffSubtasks(initial, [draft('b', 'B', 0), draft('a', 'A', 1)]);
  assert.deepEqual(
    diff.updates.map((d) => [d.id, d.order]),
    [['b', 0], ['a', 1]],
  );
});

test('order は配列の並び順で振り直す（渡された order は無視する）', () => {
  const diff = diffSubtasks([], [draft('tmp-1', 'X', 99), draft('tmp-2', 'Y', 99)]);
  assert.deepEqual(diff.creates.map((d) => d.order), [0, 1]);
});

test('消えたものは削除に入る', () => {
  const initial = [existing('a', 'A', 0), existing('b', 'B', 1)];
  const diff = diffSubtasks(initial, [draft('a', 'A', 0)]);
  assert.deepEqual(diff.deletes, ['b']);
});

test('追加・更新・削除が混ざっても振り分けられる', () => {
  const initial = [existing('a', 'A', 0), existing('b', 'B', 1), existing('c', 'C', 2)];
  const diff = diffSubtasks(initial, [
    draft('c', 'C', 0),
    draft('a', 'A+', 1),
    draft('tmp-9', '新規', 2),
  ]);
  assert.deepEqual(diff.creates.map((d) => d.title), ['新規']);
  assert.deepEqual(diff.updates.map((d) => d.id).sort(), ['a', 'c']);
  assert.deepEqual(diff.deletes, ['b']);
});

test('件数の集計', () => {
  assert.deepEqual(
    countSubtasks([draft('a', 'A', 0, true), draft('b', 'B', 1), draft('c', 'C', 2, true)]),
    { done: 2, total: 3 },
  );
  assert.deepEqual(countSubtasks([]), { done: 0, total: 0 });
});
