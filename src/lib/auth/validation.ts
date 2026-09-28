export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CredentialErrors {
  email?: string;
  password?: string;
}

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'メールアドレスを入力してください';
  if (!EMAIL_PATTERN.test(value)) return 'メールアドレスの形式が正しくありません';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'パスワードを入力してください';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`;
  }
  return undefined;
}

export function validateCredentials(email: string, password: string): CredentialErrors {
  const errors: CredentialErrors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function hasErrors(errors: CredentialErrors): boolean {
  return Boolean(errors.email || errors.password);
}
