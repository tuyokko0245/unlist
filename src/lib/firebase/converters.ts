import type { QueryDocumentSnapshot } from 'firebase/firestore';

import type { List, Subtask, Task } from '@/types/domain';
import type { ListDoc, SubtaskDoc, TaskDoc } from '@/types/firestore';

export function toList(snapshot: QueryDocumentSnapshot<ListDoc>): List {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    color: data.color,
    isDefault: data.isDefault,
    order: data.order,
    createdAt: data.createdAt?.toDate() ?? new Date(0),
    updatedAt: data.updatedAt?.toDate() ?? new Date(0),
  };
}

export function toTask(snapshot: QueryDocumentSnapshot<TaskDoc>): Task {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title,
    listId: data.listId,
    status: data.status,
    priority: data.priority,
    isStarred: data.isStarred,
    dueDate: data.dueDate?.toDate() ?? null,
    reminder: data.reminder
      ? { datetime: data.reminder.datetime.toDate(), isEnabled: data.reminder.isEnabled }
      : null,
    repeat: data.repeat,
    memo: data.memo ?? '',
    completedAt: data.completedAt?.toDate() ?? null,
    createdAt: data.createdAt?.toDate() ?? new Date(0),
    updatedAt: data.updatedAt?.toDate() ?? new Date(0),
  };
}

export function subtaskCountOf(snapshot: QueryDocumentSnapshot<TaskDoc>): { done: number; total: number } {
  const data = snapshot.data();
  return { done: data.subtaskDone ?? 0, total: data.subtaskTotal ?? 0 };
}

export function toSubtask(snapshot: QueryDocumentSnapshot<SubtaskDoc>): Subtask {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title,
    isCompleted: data.isCompleted,
    order: data.order,
    createdAt: data.createdAt?.toDate() ?? new Date(0),
  };
}
