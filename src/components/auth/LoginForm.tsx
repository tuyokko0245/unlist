'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { AppIcon } from '@/components/auth/AppIcon';
import { FullScreenSpinner } from '@/components/auth/AuthGuard';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Button } from '@/components/primitives/Button';
import { FieldError } from '@/components/primitives/FieldError';
import { Input } from '@/components/primitives/Input';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/lib/auth/authErrorMessage';
import {
  hasErrors,
  MIN_PASSWORD_LENGTH,
  validateCredentials,
  type CredentialErrors,
} from '@/lib/auth/validation';

type Mode = 'signIn' | 'signUp';

export function LoginForm() {
  const { status, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CredentialErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const signedIn = status === 'bootstrapping' || status === 'ready' || status === 'error';

  useEffect(() => {
    if (signedIn) router.replace('/today');
  }, [signedIn, router]);

  if (status === 'loading' || signedIn) return <FullScreenSpinner />;

  const isSignUp = mode === 'signUp';

  const clearMessages = () => {
    setFormError(null);
    setGoogleError(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setFieldErrors((errors) => ({ ...errors, email: undefined }));
    setFormError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setFieldErrors((errors) => ({ ...errors, password: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || googleBusy) return;
    clearMessages();

    const errors = validateCredentials(email, password);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      (errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      setFormError(authErrorMessage(error, mode));
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (submitting || googleBusy) return;
    clearMessages();
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setGoogleError(authErrorMessage(error, 'google'));
    } finally {
      setGoogleBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isSignUp ? 'signIn' : 'signUp');
    setFieldErrors({});
    clearMessages();
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-screen-max flex-1 flex-col items-center px-6 pt-16 pb-10">
      <AppIcon />
      <h1 className="mt-5 text-display tracking-[0.01em] text-brand">ウンlist</h1>
      <p className="mt-2 text-body text-fg-secondary">シンプルTodoリスト</p>

      <div className="h-12" />

      <div className="flex w-full flex-col gap-2">
        <GoogleSignInButton onClick={handleGoogle} loading={googleBusy} disabled={submitting} />
        {googleError && <FieldError message={googleError} />}
      </div>

      <div className="my-6 flex w-full items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-meta text-fg-tertiary">または</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col" aria-label={isSignUp ? '新規登録' : 'ログイン'}>
        <Input
          ref={emailRef}
          id="email"
          label="メールアドレス"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          error={fieldErrors.email}
        />

        <div className="mt-4 flex flex-col gap-2">
          <Input
            ref={passwordRef}
            id="password"
            label="パスワード"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            error={fieldErrors.password}
            helperText={isSignUp ? `${MIN_PASSWORD_LENGTH}文字以上で入力してください` : undefined}
          />
          {formError && <FieldError message={formError} />}
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={googleBusy}
          className="mt-6"
        >
          {isSignUp ? '新規登録' : 'ログイン'}
        </Button>
      </form>

      <div className="min-h-8 flex-1" />

      <p className="pt-6 text-center text-body text-fg-secondary">
        {isSignUp ? 'すでにアカウントをお持ちの方は ' : 'アカウントをお持ちでない方は '}
        <button
          type="button"
          onClick={switchMode}
          className="inline-flex min-h-tap-min items-center font-bold text-link hover:text-link-hover"
        >
          {isSignUp ? 'ログイン' : '新規登録'}
        </button>
      </p>
    </main>
  );
}
