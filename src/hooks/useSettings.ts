'use client';

import { useContext } from 'react';

import { SettingsContext, type SettingsContextValue } from '@/contexts/SettingsContext';

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings は SettingsProvider の内側で使う');
  return context;
}
