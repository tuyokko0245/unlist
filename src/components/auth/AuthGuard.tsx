'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { Button } from '@/components/primitives/Button';
import { Spinner } from '@/components/primitives/Spinner';
import { useAuth } from '@/hooks/useAuth';

export function FullScreenSpinner({ label = '読み込み中' }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center text-base-600">
      <Spinner size={32} label={label} />
    </div>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status, retryBootstrap, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'signedOut') router.replace('/login');
  }, [status, router]);

  if (status === 'ready') return <>{children}</>;

  if (status === 'error') {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-screen-max flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-h2 text-fg">データの準備ができませんでした</h1>
          <p className="text-body text-fg-secondary">
            通信環境を確認して、もう一度お試しください
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button size="lg" fullWidth onClick={retryBootstrap}>
            もう一度試す
          </Button>
          <Button size="lg" variant="secondary" fullWidth onClick={() => void signOut()}>
            ログアウト
          </Button>
        </div>
      </main>
    );
  }

  return <FullScreenSpinner label={status === 'bootstrapping' ? 'データを準備しています' : '読み込み中'} />;
}
