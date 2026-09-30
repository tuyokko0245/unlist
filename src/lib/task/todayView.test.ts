import test from 'node:test';
import assert from 'node:assert/strict';

import { createJstDate } from '@/lib/date/dueDate';
import {
  buildTaskView,
  countTodo,
  groupTodayTasks,
  taskAriaLabel,
} from '@/lib/task/todayView';
import type { Priority, Task, TaskStatus } from '@/types/domain';

const NOW = createJstDate(2026, 9, 8);
const LIST = { id: 'l1', name: '仕事', color: '#B5D5E8' };

interface Overrides {
  id?: string;
  dueDate?: Date | null;
  isStarred?: boolean;
  priority?: Priority;
  status?: TaskStatus;
  completedAt?: Date | null;
  createdAt?: Date;
}

function view(overrides: Overrides = {}) {
  const task: Task = {
    id: overrides.id ?? 't1',
    title: 'タイトル',
    listId: 'l1',
    status: overrides.status ?? 'todo',
    priority: overrides.priority ?? 'medium',
    isStarred: overrides.isStarred ?? false,
    dueDate: overrides.dueDate === undefined ? null : overrides.dueDate,
    reminder: null,
    repeat: null,
    memo: '',
    completedAt: overrides.completedAt ?? null,
    createdAt: overrides.createdAt ?? new Date(0),
    updatedAt: new Date(0),
  };
  return buildTaskView(task, LIST, NOW);
}

test('期限切れ・今日・スターに振り分ける', () => {
  const groups = groupTodayTasks([
    view({ id: 'overdue', dueDate: createJstDate(2026, 9, 3) }),
    view({ id: 'today', dueDate: NOW }),
    view({ id: 'starred', isStarred: true }),
    view({ id: 'future', dueDate: createJstDate(2026, 9, 20) }),
  ]);

  assert.deepEqual(groups.overdue.map((t) => t.id), ['overdue']);
  assert.deepEqual(groups.today.map((t) => t.id), ['today']);
  assert.deepEqual(groups.starred.map((t) => t.id), ['starred']);
});

test('期限が近い未来のタスクとスターなしは今日の画面に出さない', () => {
  const groups = groupTodayTasks([
    view({ id: 'future', dueDate: createJstDate(2026, 9, 9) }),
    view({ id: 'nodue' }),
  ]);
  assert.equal(countTodo(groups), 0);
});

test('スター付きでも期限切れ・今日なら日付側にだけ出る（重複しない）', () => {
  const groups = groupTodayTasks([
    view({ id: 'a', dueDate: createJstDate(2026, 9, 1), isStarred: true }),
    view({ id: 'b', dueDate: NOW, isStarred: true }),
  ]);
  assert.deepEqual(groups.overdue.map((t) => t.id), ['a']);
  assert.deepEqual(groups.today.map((t) => t.id), ['b']);
  assert.equal(groups.starred.length, 0);
  assert.equal(countTodo(groups), 2);
});

test('期限切れは古い順', () => {
  const groups = groupTodayTasks([
    view({ id: 'new', dueDate: createJstDate(2026, 9, 7) }),
    view({ id: 'old', dueDate: createJstDate(2026, 9, 1), priority: 'low' }),
  ]);
  assert.deepEqual(groups.overdue.map((t) => t.id), ['old', 'new']);
});

test('今日とスターは優先度の高い順・同順位は作成が古い順', () => {
  const groups = groupTodayTasks([
    view({ id: 'low', dueDate: NOW, priority: 'low' }),
    view({ id: 'high', dueDate: NOW, priority: 'high' }),
    view({ id: 'mid2', dueDate: NOW, createdAt: new Date(2000) }),
    view({ id: 'mid1', dueDate: NOW, createdAt: new Date(1000) }),
  ]);
  assert.deepEqual(groups.today.map((t) => t.id), ['high', 'mid1', 'mid2', 'low']);
});

test('完了済みは完了が新しい順', () => {
  const groups = groupTodayTasks([
    view({ id: 'older', status: 'completed', completedAt: new Date(1000) }),
    view({ id: 'newer', status: 'completed', completedAt: new Date(5000) }),
  ]);
  assert.deepEqual(groups.completed.map((t) => t.id), ['newer', 'older']);
  assert.equal(countTodo(groups), 0);
});

test('未完了件数は3セクションの合計', () => {
  const groups = groupTodayTasks([
    view({ id: 'a', dueDate: createJstDate(2026, 9, 1) }),
    view({ id: 'b', dueDate: NOW }),
    view({ id: 'c', isStarred: true }),
    view({ id: 'd', status: 'completed', completedAt: new Date() }),
  ]);
  assert.equal(countTodo(groups), 3);
});

test('読み上げラベルはタイトル・優先度・期限・リストを並べる', () => {
  assert.equal(
    taskAriaLabel(view({ dueDate: NOW, isStarred: true }), '今日'),
    'タイトル、優先度中、期限今日、リスト仕事、スター付き',
  );
  assert.equal(taskAriaLabel(view(), ''), 'タイトル、優先度中、リスト仕事');
});
