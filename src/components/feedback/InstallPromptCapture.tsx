'use client';

import { usePwaInstall } from '@/hooks/usePwaInstall';

export function InstallPromptCapture() {
  usePwaInstall();
  return null;
}
