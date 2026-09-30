'use client';

import { getDoc, getDocs, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useRef } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/hooks/useSnackbar';
import { db } from '@/lib/firebase/config';
import { subtaskDoc, subtasksCollection, taskDoc } from '@/lib/firebase/refs';
import type { Task } from '@/types/domain';
import type { SubtaskDoc, TaskDoc } from '@/types/firestore';

export interface UseTaskMutations {
  toggleComplete: (task: Task) => Promise<void>;
  toggleStar: (task: Task) => Promise<void>;
  deleteTask: (task: Task) => Promise<void>;
}

export function useTaskMutations(): UseTaskMutations {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const deleted = useRef<{
    id: string;
    data: TaskDoc;
    subtasks: { id: string; data: SubtaskDoc }[];
  } | null>(null);

  const undoDelete = useCallback(async () => {
    if (!user || !deleted.current) return;
    const snapshot = deleted.current;
    deleted.current = null;
    try {
      const batch = writeBatch(db);
      batch.set(taskDoc(db, user.uid, snapshot.id), snapshot.data);
      for (const subtask of snapshot.subtasks) {
        batch.set(subtaskDoc(db, user.uid, snapshot.id, subtask.id), subtask.data);
      }
      await batch.commit();
    } catch {
      showSnackbar({ message: 'タスクを元に戻せませんでした', variant: 'error' });
    }
  }, [user, showSnackbar]);

  const toggleComplete = useCallback(
    async (task: Task) => {
      if (!user) return;
      const nextCompleted = task.status !== 'completed';
      try {
        await updateDoc(taskDoc(db, user.uid, task.id), {
          status: nextCompleted ? 'completed' : 'todo',
          completedAt: nextCompleted ? Timestamp.now() : null,
          updatedAt: Timestamp.now(),
        });
      } catch {
        showSnackbar({ message: '更新できませんでした。通信環境を確認してください', variant: 'error' });
      }
    },
    [user, showSnackbar],
  );

  const toggleStar = useCallback(
    async (task: Task) => {
      if (!user) return;
      try {
        await updateDoc(taskDoc(db, user.uid, task.id), {
          isStarred: !task.isStarred,
          updatedAt: Timestamp.now(),
        });
      } catch {
        showSnackbar({ message: '更新できませんでした。通信環境を確認してください', variant: 'error' });
      }
    },
    [user, showSnackbar],
  );

  const deleteTask = useCallback(
    async (task: Task) => {
      if (!user) return;
      const ref = taskDoc(db, user.uid, task.id);
      try {
        const [snapshot, subtaskSnapshot] = await Promise.all([
          getDoc(ref),
          getDocs(subtasksCollection(db, user.uid, task.id)),
        ]);
        const data = snapshot.data();
        const subtasks = subtaskSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        if (data) deleted.current = { id: task.id, data, subtasks };

        const batch = writeBatch(db);
        for (const doc of subtaskSnapshot.docs) batch.delete(doc.ref);
        batch.delete(ref);
        await batch.commit();
        showSnackbar({
          message: 'タスクを削除しました',
          variant: 'warning',
          duration: 5000,
          action: { label: '元に戻す', onClick: () => void undoDelete() },
        });
      } catch {
        showSnackbar({ message: '削除できませんでした。通信環境を確認してください', variant: 'error' });
      }
    },
    [user, showSnackbar, undoDelete],
  );

  return { toggleComplete, toggleStar, deleteTask };
}
