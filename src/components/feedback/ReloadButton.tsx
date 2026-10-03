'use client';

import { Button } from '@/components/primitives/Button';

export function ReloadButton() {
  return (
    <Button size="lg" fullWidth onClick={() => window.location.reload()}>
      再試行する
    </Button>
  );
}
