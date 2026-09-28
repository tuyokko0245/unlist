'use client';

import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth は AuthProvider の内側で使う');
  return context;
}
