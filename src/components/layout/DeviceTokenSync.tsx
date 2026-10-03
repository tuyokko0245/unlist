'use client';

import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { registerDevice } from '@/lib/firebase/messaging';

export function DeviceTokenSync() {
  const { user } = useAuth();
  const { settings, isLoading } = useSettings();
  const uid = user?.uid ?? null;
  const enabled = !isLoading && settings.notificationsEnabled;
  const tokensKey = settings.fcmTokens.join('\n');

  useEffect(() => {
    if (!uid || !enabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    registerDevice(uid, tokensKey.split('\n').filter(Boolean)).catch(() => {});
  }, [uid, enabled, tokensKey]);

  return null;
}
