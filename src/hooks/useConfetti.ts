'use client';

import { useContext } from 'react';

import { ConfettiContext, type ConfettiContextValue } from '@/contexts/ConfettiContext';

export function useConfetti(): ConfettiContextValue {
  const context = useContext(ConfettiContext);
  if (!context) throw new Error('useConfetti は ConfettiProvider の内側で使う');
  return context;
}
