'use client';

import { onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { toSubtask } from '@/lib/firebase/converters';
import { subtasksCollection } from '@/lib/firebase/refs';
import type { Subtask } from '@/types/domain';

export interface UseSubtasks {
  subtasks: Subtask[];
  isLoading: boolean;
}

export function useSubtasks(taskId: string | null): UseSubtasks {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(taskId !== null);

  useEffect(() => {
    if (!user || !taskId) return;
    return onSnapshot(
      query(subtasksCollection(db, user.uid, taskId), orderBy('order')),
      (snapshot) => {
        setSubtasks(snapshot.docs.map(toSubtask));
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
  }, [user, taskId]);

  return { subtasks, isLoading };
}
