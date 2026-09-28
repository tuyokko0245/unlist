import { Spinner } from '@/components/primitives/Spinner';

export interface GoogleSignInButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.3 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.4c-.3 2.1-1.6 5.2-4.6 7.3l7.6 5.9c4.5-4.2 6.7-10.3 6.7-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.4-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.8 2.3-6.4 0-11.7-3.8-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function GoogleSignInButton({ onClick, loading = false, disabled = false }: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        'flex h-13 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-input',
        'text-button text-fg transition-[background-color,transform,opacity] duration-100',
        'enabled:hover:bg-base-50 enabled:active:scale-[0.97] enabled:active:opacity-80',
        loading ? 'cursor-progress' : 'disabled:cursor-not-allowed disabled:opacity-60',
      ].join(' ')}
    >
      {loading ? <Spinner size={20} label="Googleでログイン中" /> : <GoogleLogo />}
      <span>Googleでログイン</span>
    </button>
  );
}
