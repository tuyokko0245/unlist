export type AuthAction = 'signIn' | 'signUp' | 'google';

const SILENT_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

const INVALID_CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-email',
]);

const FALLBACK: Record<AuthAction, string> = {
  signIn: 'ログインに失敗しました。もう一度お試しください',
  signUp: '新規登録に失敗しました。もう一度お試しください',
  google: 'Googleログインに失敗しました。もう一度お試しください',
};

export function getAuthErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  const { code } = error as { code: unknown };
  return typeof code === 'string' ? code : null;
}

export function authErrorMessage(error: unknown, action: AuthAction): string | null {
  const code = getAuthErrorCode(error);

  if (code && SILENT_CODES.has(code)) return null;

  switch (code) {
    case 'auth/network-request-failed':
      return 'ネットワークに接続できません。通信環境を確認してもう一度お試しください';
    case 'auth/too-many-requests':
      return '試行回数が多すぎます。しばらく待ってからもう一度お試しください';
    case 'auth/email-already-in-use':
      return 'このメールアドレスはすでに登録されています。ログインしてください';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください';
    case 'auth/user-disabled':
      return 'このアカウントは無効になっています';
    case 'auth/popup-blocked':
      return 'ポップアップがブロックされました。ブラウザの設定でこのサイトのポップアップを許可してください';
    case 'auth/unauthorized-domain':
      return 'このURLではGoogleログインを利用できません。メールアドレスでログインしてください';
    case 'auth/operation-not-supported-in-this-environment':
      return 'この環境ではGoogleログインを利用できません。Safariなどのブラウザで開いてからログインしてください';
  }

  if (code && INVALID_CREDENTIAL_CODES.has(code) && action === 'signIn') {
    return 'メールアドレスまたはパスワードが正しくありません';
  }

  return FALLBACK[action];
}
