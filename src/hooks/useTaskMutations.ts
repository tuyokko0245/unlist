'use client';

import { deleteDoc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useCallback, useRef } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from '@/hooks/useSnackbar';
import { db } from '@/lib/firebase/config';
import { taskDoc } from '@/lib/firebase/refs';
import type { Task } from '@/types/domain';
import type { TaskDoc } from '@/types/firestore';

export interface UseTaskMutations {
  toggleComplete: (task: Task) => Promise<void>;
  toggleStar: (task: Task) => Promise<void>;
  deleteTask: (task: Task) => Promise<void>;
}

export function useTaskMutations(): UseTaskMutations {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const deleted = useRef<{ id: string; data: TaskDoc } | null>(null);

  const undoDelete = useCallback(async () => {
    if (!user || !deleted.current) return;
    const snapshot = deleted.current;
    deleted.current = null;
    try {
      await setDoc(taskDoc(db, user.uid, snapshot.id), snapshot.data);
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
        const snapshot = await getDoc(ref);
        const data = snapshot.data();
        if (data) deleted.current = { id: task.id, data };
        await deleteDoc(ref);
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
