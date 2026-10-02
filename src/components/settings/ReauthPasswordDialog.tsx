'use client';

import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';

export function ReauthPasswordDialog({
  email,
  onSubmit,
  onCancel,
}: {
  email: string;
  onSubmit: (password: string) => Promise<string | null>;
  onCancel: () => void;
}) {
  const titleId = useId();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const submit = async () => {
    if (!password || isSubmitting) return;
    setIsSubmitting(true);
    const message = await onSubmit(password);
    setIsSubmitting(false);
    if (message) setError(message);
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center px-6">
      <div aria-hidden="true" className="absolute inset-0 bg-[var(--color-overlay)]" />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="relative z-85 flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-elevated p-5 shadow-lg motion-safe:animate-[dialog-in_200ms_ease-out]"
      >
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-h3 text-fg">
            本人確認
          </h2>
          <p className="text-body text-fg-secondary">
            退会の前に、{email} のパスワードを入力してください
          </p>
        </div>
        <Input
          id="reauth-password"
          label="パスワード"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setError(null);
          }}
          error={error ?? undefined}
          autoFocus
          autoComplete="current-password"
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" variant="danger" loading={isSubmitting} disabled={!password}>
            確認して退会
          </Button>
        </div>
      </form>
    </div>
  );
}
