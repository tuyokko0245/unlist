'use client';

import { onSnapshot, orderBy, query } from 'firebase/firestore';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { toList } from '@/lib/firebase/converters';
import { listsCollection } from '@/lib/firebase/refs';
import type { List } from '@/types/domain';

export interface ListsContextValue {
  lists: List[];
  listMap: Map<string, List>;
  defaultList: List | null;
  isLoading: boolean;
  error: Error | null;
}

export const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(listsCollection(db, user.uid), orderBy('order')),
      (snapshot) => {
        setLists(snapshot.docs.map(toList));
        setError(null);
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setIsLoading(false);
      },
    );
  }, [user]);

  const value = useMemo<ListsContextValue>(() => {
    const listMap = new Map(lists.map((list) => [list.id, list]));
    return {
      lists,
      listMap,
      defaultList: lists.find((list) => list.isDefault) ?? lists[0] ?? null,
      isLoading,
      error,
    };
  }, [lists, isLoading, error]);

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}
