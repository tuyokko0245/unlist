'use client';

import {
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { useCallback, useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { needsReauthentication, reauthMethodOf, type ReauthMethod } from '@/lib/auth/recentLogin';
import { auth, db } from '@/lib/firebase/config';
import { deleteUserData } from '@/lib/firebase/deleteUserData';
import { unregisterDevice } from '@/lib/firebase/messaging';
import { THEME_STORAGE_KEY } from '@/lib/theme/applyBaseColor';

export interface UseAccountDeletion {
  reauthMethod: ReauthMethod | null;
  needsReauth: () => boolean;
  reauthWithGoogle: () => Promise<void>;
  reauthWithPassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

function currentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error('not signed in');
  return user;
}

export function useAccountDeletion(): UseAccountDeletion {
  const { user } = useAuth();

  const reauthMethod = useMemo(
    () => (user ? reauthMethodOf(user.providerData.map((profile) => profile.providerId)) : null),
    [user],
  );

  const needsReauth = useCallback(
    () => needsReauthentication(auth.currentUser?.metadata.lastSignInTime),
    [],
  );

  const reauthWithGoogle = useCallback(async () => {
    await reauthenticateWithPopup(currentUser(), new GoogleAuthProvider());
  }, []);

  const reauthWithPassword = useCallback(async (password: string) => {
    const target = currentUser();
    await reauthenticateWithCredential(target, EmailAuthProvider.credential(target.email ?? '', password));
  }, []);

  const deleteAccount = useCallback(async () => {
    const target = currentUser();
    await deleteUserData(db, target.uid);
    await unregisterDevice(null);
    await deleteUser(target);
    try {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {}
  }, []);

  return { reauthMethod, needsReauth, reauthWithGoogle, reauthWithPassword, deleteAccount };
}
