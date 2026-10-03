'use client';

import { doc, Timestamp, writeBatch } from 'firebase/firestore';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { subtaskDoc, subtasksCollection, taskDoc, tasksCollection } from '@/lib/firebase/refs';
import { countSubtasks, diffSubtasks, type SubtaskDraft } from '@/lib/task/subtaskDiff';
import type { Subtask, Task } from '@/types/domain';
import type { TaskDoc } from '@/types/firestore';

export interface TaskFormValues {
  title: string;
  listId: string;
  priority: Task['priority'];
  isStarred: boolean;
  dueDate: Date | null;
  reminder: Task['reminder'];
  repeat: Task['repeat'];
  memo: string;
}

function toTaskFields(values: TaskFormValues, drafts: SubtaskDraft[]) {
  const counts = countSubtasks(drafts);
  return {
    title: values.title.trim(),
    listId: values.listId,
    priority: values.priority,
    isStarred: values.isStarred,
    dueDate: values.dueDate ? Timestamp.fromDate(values.dueDate) : null,
    reminder: values.reminder
      ? {
          datetime: Timestamp.fromDate(values.reminder.datetime),
          isEnabled: values.reminder.isEnabled,
          sentAt: values.reminder.sentAt ? Timestamp.fromDate(values.reminder.sentAt) : null,
        }
      : null,
    repeat: values.repeat,
    memo: values.memo,
    subtaskDone: counts.done,
    subtaskTotal: counts.total,
    updatedAt: Timestamp.now(),
  };
}

export interface UseSaveTask {
  createTask: (values: TaskFormValues, drafts: SubtaskDraft[]) => Promise<string>;
  updateTask: (
    taskId: string,
    values: TaskFormValues,
    drafts: SubtaskDraft[],
    initialSubtasks: Subtask[],
  ) => Promise<void>;
}

export function useSaveTask(): UseSaveTask {
  const { user } = useAuth();

  const createTask = useCallback(
    async (values: TaskFormValues, drafts: SubtaskDraft[]) => {
      if (!user) throw new Error('not signed in');

      const batch = writeBatch(db);
      const ref = doc(tasksCollection(db, user.uid));
      const now = Timestamp.now();

      batch.set(ref, {
        ...toTaskFields(values, drafts),
        status: 'todo',
        completedAt: null,
        createdAt: now,
      } as TaskDoc);

      drafts.forEach((draft, index) => {
        batch.set(doc(subtasksCollection(db, user.uid, ref.id)), {
          title: draft.title,
          isCompleted: draft.isCompleted,
          order: index,
          createdAt: now,
        });
      });

      await batch.commit();
      return ref.id;
    },
    [user],
  );

  const updateTask = useCallback(
    async (taskId: string, values: TaskFormValues, drafts: SubtaskDraft[], initialSubtasks: Subtask[]) => {
      if (!user) throw new Error('not signed in');

      const batch = writeBatch(db);
      batch.update(taskDoc(db, user.uid, taskId), toTaskFields(values, drafts));

      const diff = diffSubtasks(initialSubtasks, drafts);
      const now = Timestamp.now();

      for (const created of diff.creates) {
        batch.set(doc(subtasksCollection(db, user.uid, taskId)), {
          title: created.title,
          isCompleted: created.isCompleted,
          order: created.order,
          createdAt: now,
        });
      }
      for (const updated of diff.updates) {
        batch.update(subtaskDoc(db, user.uid, taskId, updated.id), {
          title: updated.title,
          isCompleted: updated.isCompleted,
          order: updated.order,
        });
      }
      for (const deletedId of diff.deletes) {
        batch.delete(subtaskDoc(db, user.uid, taskId, deletedId));
      }

      await batch.commit();
    },
    [user],
  );

  return { createTask, updateTask };
}
