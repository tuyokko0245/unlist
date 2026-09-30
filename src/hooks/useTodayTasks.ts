'use client';

import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useLists } from '@/hooks/useLists';
import { db } from '@/lib/firebase/config';
import { subtaskCountOf, toTask } from '@/lib/firebase/converters';
import { tasksCollection } from '@/lib/firebase/refs';
import { buildTaskView, groupTodayTasks, type TodayGroups } from '@/lib/task/todayView';
import type { Task, TaskView } from '@/types/domain';

const COMPLETED_PAGE_SIZE = 50;

interface RawTask {
  task: Task;
  subtaskCount: { done: number; total: number };
}

export interface UseTodayTasks {
  groups: TodayGroups;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useTodayTasks(): UseTodayTasks {
  const { user } = useAuth();
  const { listMap, isLoading: listsLoading } = useLists();

  const [todo, setTodo] = useState<RawTask[]>([]);
  const [completed, setCompleted] = useState<RawTask[]>([]);
  const [loadedTodo, setLoadedTodo] = useState(false);
  const [loadedCompleted, setLoadedCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!user) return;

    const tasks = tasksCollection(db, user.uid);

    const unsubscribeTodo = onSnapshot(
      query(tasks, where('status', '==', 'todo')),
      (snapshot) => {
        setTodo(snapshot.docs.map((doc) => ({ task: toTask(doc), subtaskCount: subtaskCountOf(doc) })));
        setError(null);
        setLoadedTodo(true);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoadedTodo(true);
      },
    );

    const unsubscribeCompleted = onSnapshot(
      query(
        tasks,
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc'),
        limit(COMPLETED_PAGE_SIZE),
      ),
      (snapshot) => {
        setCompleted(snapshot.docs.map((doc) => ({ task: toTask(doc), subtaskCount: subtaskCountOf(doc) })));
        setLoadedCompleted(true);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoadedCompleted(true);
      },
    );

    return () => {
      unsubscribeTodo();
      unsubscribeCompleted();
    };
  }, [user, nonce]);

  const groups = useMemo(() => {
    const now = new Date();
    const views: TaskView[] = [...todo, ...completed].map((raw) =>
      buildTaskView(raw.task, listMap.get(raw.task.listId), now, raw.subtaskCount),
    );
    return groupTodayTasks(views);
  }, [todo, completed, listMap]);

  const retry = useCallback(() => setNonce((value) => value + 1), []);

  return {
    groups,
    isLoading: !loadedTodo || !loadedCompleted || listsLoading,
    error,
    retry,
  };
}
