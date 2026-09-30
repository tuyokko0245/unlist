'use client';

import { useContext } from 'react';

import { ConfirmDialogContext, type ConfirmDialogContextValue } from '@/contexts/ConfirmDialogContext';

export function useConfirmDialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);
  if (!context) throw new Error('useConfirmDialog は ConfirmDialogProvider の内側で使う');
  return context;
}
