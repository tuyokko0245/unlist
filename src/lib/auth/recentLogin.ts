export const RECENT_LOGIN_WINDOW_MS = 4 * 60 * 1000;

export type ReauthMethod = 'google' | 'password';

export function needsReauthentication(lastSignInTime: string | undefined, now: number = Date.now()): boolean {
  if (!lastSignInTime) return true;
  const signedInAt = Date.parse(lastSignInTime);
  if (Number.isNaN(signedInAt)) return true;
  return now - signedInAt > RECENT_LOGIN_WINDOW_MS;
}

export function reauthMethodOf(providerIds: string[]): ReauthMethod | null {
  if (providerIds.includes('google.com')) return 'google';
  if (providerIds.includes('password')) return 'password';
  return null;
}
