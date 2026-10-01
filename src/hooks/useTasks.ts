'use client';

import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useLists } from '@/hooks/useLists';
import { db } from '@/lib/firebase/config';
import { subtaskCountOf, toTask } from '@/lib/firebase/converters';
import { tasksCollection } from '@/lib/firebase/refs';
import type { StatusFilter } from '@/lib/task/listView';
import { buildTaskView } from '@/lib/task/todayView';
import type { Task, TaskView } from '@/types/domain';

const COMPLETED_PAGE_SIZE = 50;

interface RawTask {
  task: Task;
  subtaskCount: { done: number; total: number };
}

export interface UseTasksOptions {
  listId: string | null;
  status: StatusFilter;
}

export interface UseTasks {
  todoTasks: TaskView[];
  completedTasks: TaskView[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  hasMoreCompleted: boolean;
  loadMoreCompleted: () => void;
}

export function useTasks({ listId, status }: UseTasksOptions): UseTasks {
  const { user } = useAuth();
  const { listMap, isLoading: listsLoading } = useLists();

  const [todo, setTodo] = useState<RawTask[]>([]);
  const [completed, setCompleted] = useState<RawTask[]>([]);
  const [loadedTodo, setLoadedTodo] = useState(false);
  const [loadedCompleted, setLoadedCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);
  const [completedLimit, setCompletedLimit] = useState(COMPLETED_PAGE_SIZE);
  const [reachedEnd, setReachedEnd] = useState(false);

  const needsCompleted = status !== 'todo';

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      query(tasksCollection(db, user.uid), where('status', '==', 'todo')),
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
  }, [user, nonce]);

  useEffect(() => {
    if (!user || !needsCompleted) return;

    const constraints = [
      where('status', '==', 'completed'),
      ...(listId ? [where('listId', '==', listId)] : []),
      orderBy('completedAt', 'desc'),
      limit(completedLimit),
    ];

    return onSnapshot(
      query(tasksCollection(db, user.uid), ...constraints),
      (snapshot) => {
        setCompleted(
          snapshot.docs.map((doc) => ({ task: toTask(doc), subtaskCount: subtaskCountOf(doc) })),
        );
        setReachedEnd(snapshot.size < completedLimit);
        setLoadedCompleted(true);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoadedCompleted(true);
      },
    );
  }, [user, nonce, needsCompleted, listId, completedLimit]);

  const toViews = useCallback(
    (raws: RawTask[]) => {
      const now = new Date();
      return raws.map((raw) =>
        buildTaskView(raw.task, listMap.get(raw.task.listId), now, raw.subtaskCount),
      );
    },
    [listMap],
  );

  const todoTasks = useMemo(() => toViews(todo), [todo, toViews]);
  const completedTasks = useMemo(
    () => (needsCompleted ? toViews(completed) : []),
    [completed, needsCompleted, toViews],
  );

  const retry = useCallback(() => setNonce((value) => value + 1), []);
  const loadMoreCompleted = useCallback(
    () => setCompletedLimit((value) => value + COMPLETED_PAGE_SIZE),
    [],
  );

  return {
    todoTasks,
    completedTasks,
    isLoading: !loadedTodo || (needsCompleted && !loadedCompleted) || listsLoading,
    error,
    retry,
    hasMoreCompleted: needsCompleted && !reachedEnd,
    loadMoreCompleted,
  };
}
