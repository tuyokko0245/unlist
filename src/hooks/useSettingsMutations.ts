'use client';

import { setDoc } from 'firebase/firestore';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { userSettingsDoc } from '@/lib/firebase/refs';

export function useSettingsMutations(): {
  updateBaseColor: (baseColor: string) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
} {
  const { user } = useAuth();

  const updateBaseColor = useCallback(
    async (baseColor: string) => {
      if (!user) return;
      await setDoc(userSettingsDoc(db, user.uid), { baseColor }, { merge: true });
    },
    [user],
  );

  const setNotificationsEnabled = useCallback(
    async (notificationsEnabled: boolean) => {
      if (!user) return;
      await setDoc(userSettingsDoc(db, user.uid), { notificationsEnabled }, { merge: true });
    },
    [user],
  );

  return { updateBaseColor, setNotificationsEnabled };
}
