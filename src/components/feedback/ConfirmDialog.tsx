'use client';

import { useEffect, useId, useRef } from 'react';

import { Button } from '@/components/primitives/Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isProcessing?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'キャンセル',
  isDangerous = false,
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    confirmRef.current?.querySelector<HTMLElement>('button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--color-overlay)] motion-safe:animate-[fade-in_200ms_ease-out]"
      />
      <div
        ref={confirmRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-85 flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-elevated p-5 shadow-lg motion-safe:animate-[dialog-in_200ms_ease-out]"
      >
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-h3 text-fg">
            {title}
          </h2>
          {message && <p className="text-body text-fg-secondary">{message}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isProcessing}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            loading={isProcessing}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
