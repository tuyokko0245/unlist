'use client';

import type { Snackbar } from '@/contexts/SnackbarContext';

const VARIANT_CLASS: Record<Snackbar['variant'], string> = {
  success: 'bg-surface border-base-300 text-fg',
  info: 'bg-surface border-border text-fg',
  warning: 'bg-surface border-warning text-fg',
  error: 'bg-danger-bg border-danger text-danger',
};

export function SnackbarHost({
  snackbar,
  onDismiss,
}: {
  snackbar: Snackbar | null;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+16px)] md:pb-[calc(env(safe-area-inset-bottom)+16px)]"
    >
      {snackbar && (
        <div
          key={snackbar.id}
          className={`pointer-events-auto flex w-full max-w-content-max items-center gap-3 rounded-md border px-4 py-3 shadow-md motion-safe:animate-[snackbar-in_200ms_ease-out] ${VARIANT_CLASS[snackbar.variant]}`}
        >
          <span className="flex-1 text-body">{snackbar.message}</span>
          {snackbar.action && (
            <button
              type="button"
              onClick={() => {
                snackbar.action?.onClick();
                onDismiss();
              }}
              className="min-h-tap-min shrink-0 px-2 text-button font-bold text-base-700"
            >
              {snackbar.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
