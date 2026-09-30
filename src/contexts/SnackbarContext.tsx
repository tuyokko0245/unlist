'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { SnackbarHost } from '@/components/feedback/SnackbarHost';

export type SnackbarVariant = 'success' | 'info' | 'warning' | 'error';

export interface SnackbarOptions {
  message: string;
  variant?: SnackbarVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export interface Snackbar extends SnackbarOptions {
  id: number;
  variant: SnackbarVariant;
  duration: number;
}

export interface SnackbarContextValue {
  showSnackbar: (options: SnackbarOptions) => void;
  dismissSnackbar: () => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<Snackbar | null>(null);
  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const dismissSnackbar = useCallback(() => {
    clearTimer();
    setSnackbar(null);
  }, [clearTimer]);

  const showSnackbar = useCallback(
    (options: SnackbarOptions) => {
      clearTimer();
      const duration = options.duration ?? (options.action ? 5000 : 3000);
      nextId.current += 1;
      setSnackbar({ ...options, id: nextId.current, variant: options.variant ?? 'success', duration });
      timer.current = setTimeout(() => setSnackbar(null), duration);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(() => ({ showSnackbar, dismissSnackbar }), [showSnackbar, dismissSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <SnackbarHost snackbar={snackbar} onDismiss={dismissSnackbar} />
    </SnackbarContext.Provider>
  );
}
