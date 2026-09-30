'use client';

import { useContext } from 'react';

import { ListsContext, type ListsContextValue } from '@/contexts/ListsContext';

export function useLists(): ListsContextValue {
  const context = useContext(ListsContext);
  if (!context) throw new Error('useLists は ListsProvider の内側で使う');
  return context;
}
