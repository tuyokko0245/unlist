'use client';

import { onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { toTask } from '@/lib/firebase/converters';
import { taskDoc } from '@/lib/firebase/refs';
import type { Task } from '@/types/domain';

export interface UseTask {
  task: Task | null;
  isLoading: boolean;
  notFound: boolean;
  error: Error | null;
}

export function useTask(taskId: string): UseTask {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      taskDoc(db, user.uid, taskId),
      (snapshot) => {
        if (snapshot.exists()) {
          setTask(toTask(snapshot));
          setNotFound(false);
        } else {
          setTask(null);
          setNotFound(true);
        }
        setError(null);
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setIsLoading(false);
      },
    );
  }, [user, taskId]);

  return { task, isLoading, notFound, error };
}
