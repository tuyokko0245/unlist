'use client';

import { onSnapshot } from 'firebase/firestore';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_BASE_COLOR } from '@/constants/palette';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { userSettingsDoc } from '@/lib/firebase/refs';
import { applyBaseColor, readCachedTheme, watchColorScheme } from '@/lib/theme/applyBaseColor';
import type { UserSettings } from '@/types/domain';

export interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  baseColor: DEFAULT_BASE_COLOR,
  notificationsEnabled: false,
  fcmTokens: [],
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(
    () => ({ ...DEFAULT_SETTINGS, baseColor: readCachedTheme()?.baseColor ?? DEFAULT_BASE_COLOR }),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(userSettingsDoc(db, user.uid), (snapshot) => {
      const data = snapshot.data();
      if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
      setIsLoading(false);
    });
  }, [user]);

  useEffect(() => {
    const theme = applyBaseColor(settings.baseColor);
    return watchColorScheme(theme);
  }, [settings.baseColor]);

  const value = useMemo(() => ({ settings, isLoading }), [settings, isLoading]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
