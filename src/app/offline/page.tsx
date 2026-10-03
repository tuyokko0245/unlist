import type { Metadata } from 'next';

import { AppIcon } from '@/components/auth/AppIcon';
import { ReloadButton } from '@/components/feedback/ReloadButton';

export const metadata: Metadata = {
  title: 'オフライン - ウンlist',
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-content-max flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <AppIcon />
        <p className="text-h2 font-bold text-brand">ウンlist</p>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 text-fg">インターネット接続が必要です</h1>
        <p className="text-body text-fg-secondary">
          この画面はまだ端末に保存されていません。接続を確認してから、もう一度お試しください
        </p>
      </div>
      <ReloadButton />
    </main>
  );
}
