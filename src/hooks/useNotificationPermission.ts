'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type NotificationPermissionState = 'unsupported' | NotificationPermission;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  let status: PermissionStatus | null = null;
  navigator.permissions
    ?.query({ name: 'notifications' })
    .then((result) => {
      status = result;
      result.addEventListener('change', onChange);
    })
    .catch(() => {});
  return () => {
    listeners.delete(onChange);
    status?.removeEventListener('change', onChange);
  };
}

function getSnapshot(): NotificationPermissionState {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

export function useNotificationPermission(): {
  permission: NotificationPermissionState;
  request: () => Promise<NotificationPermissionState>;
} {
  const permission = useSyncExternalStore(subscribe, getSnapshot, () => 'default' as const);

  const request = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported' as const;
    const result = await Notification.requestPermission();
    notify();
    return result;
  }, []);

  return { permission, request };
}
