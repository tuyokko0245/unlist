'use client';

import { useContext } from 'react';

import { SnackbarContext, type SnackbarContextValue } from '@/contexts/SnackbarContext';

export function useSnackbar(): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar は SnackbarProvider の内側で使う');
  return context;
}
