'use client';

import { Smartphone, X } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';

import { PwaInstallModal } from '@/components/settings/PwaInstallModal';
import { usePwaInstall } from '@/hooks/usePwaInstall';

const DISMISSED_KEY = 'unlist.installBannerDismissed';
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function dismiss(): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, '1');
  } catch {}
  for (const listener of listeners) listener();
}

export function InstallBanner() {
  const { mode, install } = usePwaInstall();
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (dismissed || (mode !== 'prompt' && mode !== 'ios')) {
    return <PwaInstallModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />;
  }

  const add = () => {
    if (mode === 'ios') {
      setIsGuideOpen(true);
      return;
    }
    void install().then((accepted) => {
      if (accepted) dismiss();
    });
  };

  return (
    <>
      <aside
        aria-label="ホーム画面に追加"
        className="flex items-center gap-3 rounded-card border border-border bg-surface py-2 pr-1 pl-4 shadow-sm"
      >
        <Smartphone size={22} aria-hidden="true" className="shrink-0 text-base-600" />
        <p className="min-w-0 flex-1 text-meta text-fg-secondary">
          ホーム画面に追加すると、通知が届きやすくなります
        </p>
        <button
          type="button"
          onClick={add}
          className="h-tap-min shrink-0 rounded-md bg-base-300 px-3.5 text-meta font-bold text-on-base"
        >
          追加する
        </button>
        <button
          type="button"
          aria-label="この案内を閉じる"
          onClick={dismiss}
          className="flex size-tap-min shrink-0 items-center justify-center rounded-md text-fg-tertiary"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </aside>
      <PwaInstallModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
