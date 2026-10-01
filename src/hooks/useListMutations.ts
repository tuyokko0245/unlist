'use client';

import { addDoc, serverTimestamp, type WithFieldValue } from 'firebase/firestore';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useLists } from '@/hooks/useLists';
import { db } from '@/lib/firebase/config';
import { listsCollection } from '@/lib/firebase/refs';
import type { ListDoc } from '@/types/firestore';

export interface ListFormValues {
  name: string;
  color: string;
}

export interface UseListMutations {
  createList: (values: ListFormValues) => Promise<string>;
}

export function useListMutations(): UseListMutations {
  const { user } = useAuth();
  const { lists } = useLists();

  const createList = useCallback(
    async ({ name, color }: ListFormValues) => {
      if (!user) throw new Error('未ログイン');
      const nextOrder = lists.reduce((max, list) => Math.max(max, list.order), -1) + 1;
      const data: WithFieldValue<ListDoc> = {
        name: name.trim(),
        color,
        isDefault: false,
        order: nextOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const created = await addDoc(listsCollection(db, user.uid), data);
      return created.id;
    },
    [user, lists],
  );

  return { createList };
}
