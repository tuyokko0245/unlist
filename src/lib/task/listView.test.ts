import test from 'node:test';
import assert from 'node:assert/strict';

import { createJstDate } from '@/lib/date/dueDate';
import {
  compareTaskList,
  countTodoByList,
  insertHeldTasks,
  selectCompletedTasks,
  selectTodoTasks,
} from '@/lib/task/listView';
import { buildTaskView } from '@/lib/task/todayView';
import type { Priority, Task, TaskStatus, TaskView } from '@/types/domain';

const NOW = createJstDate(2026, 10, 2);
const LIST = { id: 'l1', name: '仕事', color: '#B5D5E8' };

interface Overrides {
  id?: string;
  listId?: string;
  dueDate?: Date | null;
  isStarred?: boolean;
  priority?: Priority;
  status?: TaskStatus;
  completedAt?: Date | null;
  createdAt?: Date;
}

function view(overrides: Overrides = {}): TaskView {
  const task: Task = {
    id: overrides.id ?? 't1',
    title: 'タイトル',
    listId: overrides.listId ?? 'l1',
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

const ids = (tasks: TaskView[]) => tasks.map((task) => task.id);

test('スター付きが先頭に来る', () => {
  const starred = view({ id: 'starred', isStarred: true, priority: 'low' });
  const high = view({ id: 'high', priority: 'high' });
  assert.deepEqual(ids([high, starred].sort(compareTaskList)), ['starred', 'high']);
});

test('スターが同じなら優先度の高い順になる', () => {
  const low = view({ id: 'low', priority: 'low' });
  const medium = view({ id: 'medium', priority: 'medium' });
  const high = view({ id: 'high', priority: 'high' });
  assert.deepEqual(ids([low, high, medium].sort(compareTaskList)), ['high', 'medium', 'low']);
});

test('優先度が同じなら期限の早い順で、期限なしは末尾になる', () => {
  const none = view({ id: 'none', dueDate: null });
  const soon = view({ id: 'soon', dueDate: createJstDate(2026, 10, 3) });
  const later = view({ id: 'later', dueDate: createJstDate(2026, 11, 1) });
  assert.deepEqual(ids([none, later, soon].sort(compareTaskList)), ['soon', 'later', 'none']);
});

test('期限も同じなら作成日時の古い順になる', () => {
  const older = view({ id: 'older', createdAt: new Date(1000) });
  const newer = view({ id: 'newer', createdAt: new Date(2000) });
  assert.deepEqual(ids([newer, older].sort(compareTaskList)), ['older', 'newer']);
});

test('リスト指定でそのリストのタスクだけに絞られる', () => {
  const tasks = [view({ id: 'a', listId: 'l1' }), view({ id: 'b', listId: 'l2' })];
  assert.deepEqual(ids(selectTodoTasks(tasks, { listId: 'l2', starredOnly: false })), ['b']);
  assert.deepEqual(ids(selectTodoTasks(tasks, { listId: null, starredOnly: false })), ['a', 'b']);
});

test('スターのみでスター付きだけに絞られる', () => {
  const tasks = [view({ id: 'a', isStarred: true }), view({ id: 'b' })];
  assert.deepEqual(ids(selectTodoTasks(tasks, { listId: null, starredOnly: true })), ['a']);
});

test('完了済みは完了日時の新しい順に並ぶ', () => {
  const tasks = [
    view({ id: 'old', status: 'completed', completedAt: new Date(1000) }),
    view({ id: 'new', status: 'completed', completedAt: new Date(3000) }),
  ];
  assert.deepEqual(ids(selectCompletedTasks(tasks, { listId: null, starredOnly: false })), [
    'new',
    'old',
  ]);
});

test('リストごとの未完了件数を数える（0件のリストもキーを持つ）', () => {
  const tasks = [
    view({ id: 'a', listId: 'l1' }),
    view({ id: 'b', listId: 'l1' }),
    view({ id: 'c', listId: 'l2' }),
  ];
  assert.deepEqual(countTodoByList(tasks, ['l1', 'l2', 'l3']), { l1: 2, l2: 1, l3: 0 });
});

test('完了直後のタスクを元の位置に差し戻す', () => {
  const rows = [view({ id: 'a' }), view({ id: 'b' })];
  const held = view({ id: 'held' });
  assert.deepEqual(ids(insertHeldTasks(rows, [{ task: held, index: 1 }])), ['a', 'held', 'b']);
});

test('差し戻し対象が既に一覧にあれば重複しない', () => {
  const rows = [view({ id: 'a' }), view({ id: 'b' })];
  assert.deepEqual(ids(insertHeldTasks(rows, [{ task: rows[0], index: 0 }])), ['a', 'b']);
});

test('差し戻し位置が一覧より後ろなら末尾に入る', () => {
  const rows = [view({ id: 'a' })];
  const held = view({ id: 'held' });
  assert.deepEqual(ids(insertHeldTasks(rows, [{ task: held, index: 9 }])), ['a', 'held']);
});
