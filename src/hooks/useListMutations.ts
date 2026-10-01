'use client';

import {
  addDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type WithFieldValue,
} from 'firebase/firestore';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useLists } from '@/hooks/useLists';
import { chunk } from '@/lib/firebase/batch';
import { db } from '@/lib/firebase/config';
import { listDoc, listsCollection, taskDoc, tasksCollection } from '@/lib/firebase/refs';
import { nextListOrder, orderUpdates } from '@/lib/list/reorder';
import type { List } from '@/types/domain';
import type { ListDoc } from '@/types/firestore';

export interface ListFormValues {
  name: string;
  color: string;
}

export interface UseListMutations {
  createList: (values: ListFormValues) => Promise<string>;
  updateList: (list: List, values: ListFormValues) => Promise<void>;
  deleteList: (list: List) => Promise<number>;
  reorderLists: (ordered: List[]) => Promise<void>;
}

export function useListMutations(): UseListMutations {
  const { user } = useAuth();
  const { lists, defaultList } = useLists();

  const createList = useCallback(
    async ({ name, color }: ListFormValues) => {
      if (!user) throw new Error('未ログイン');
      const data: WithFieldValue<ListDoc> = {
        name: name.trim(),
        color,
        isDefault: false,
        order: nextListOrder(lists),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const created = await addDoc(listsCollection(db, user.uid), data);
      return created.id;
    },
    [user, lists],
  );

  const updateList = useCallback(
    async (list: List, { name, color }: ListFormValues) => {
      if (!user) throw new Error('未ログイン');
      await updateDoc(listDoc(db, user.uid, list.id), {
        ...(list.isDefault ? {} : { name: name.trim() }),
        color,
        updatedAt: serverTimestamp(),
      });
    },
    [user],
  );

  const deleteList = useCallback(
    async (list: List) => {
      if (!user) throw new Error('未ログイン');
      if (list.isDefault) throw new Error('受信トレイは削除できない');
      if (!defaultList) throw new Error('受信トレイが見つからない');

      const snapshot = await getDocs(
        query(tasksCollection(db, user.uid), where('listId', '==', list.id)),
      );

      for (const part of chunk(snapshot.docs)) {
        const batch = writeBatch(db);
        for (const task of part) {
          batch.update(taskDoc(db, user.uid, task.id), {
            listId: defaultList.id,
            updatedAt: Timestamp.now(),
          });
        }
        await batch.commit();
      }

      const removal = writeBatch(db);
      removal.delete(listDoc(db, user.uid, list.id));
      await removal.commit();

      return snapshot.size;
    },
    [user, defaultList],
  );

  const reorderLists = useCallback(
    async (ordered: List[]) => {
      if (!user) throw new Error('未ログイン');
      const updates = orderUpdates(ordered);
      if (updates.length === 0) return;

      for (const part of chunk(updates)) {
        const batch = writeBatch(db);
        for (const update of part) {
          batch.update(listDoc(db, user.uid, update.id), {
            order: update.order,
            updatedAt: Timestamp.now(),
          });
        }
        await batch.commit();
      }
    },
    [user],
  );

  return { createList, updateList, deleteList, reorderLists };
}
