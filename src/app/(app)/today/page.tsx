'use client';

import { Button } from '@/components/primitives/Button';
import { useAuth } from '@/hooks/useAuth';

export default function TodayPage() {
  const { user, signOut } = useAuth();

  return (
    <main className="mx-auto w-full max-w-screen-max px-4 py-6">
      <h1 className="text-h1 text-fg">今日</h1>
      <p className="mt-2 text-meta text-fg-tertiary">Tier 1 #2 で実装する（{user?.email}）</p>
      <Button variant="secondary" className="mt-6" onClick={() => void signOut()}>
        ログアウト
      </Button>
    </main>
  );
}
