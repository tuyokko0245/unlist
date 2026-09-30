'use client';

import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/primitives/Button';

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-card border border-danger bg-danger-bg p-4 text-danger"
    >
      <p className="flex items-start gap-2 text-body">
        <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
        {message}
      </p>
      <div>
        <Button size="sm" variant="secondary" onClick={onRetry}>
          再試行
        </Button>
      </div>
    </div>
  );
}
