import { onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion, setDoc } from 'firebase/firestore';
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging';

import { app, auth, db } from '@/lib/firebase/config';
import { userSettingsDoc } from '@/lib/firebase/refs';

const TOKEN_STORAGE_KEY = 'unlist.fcmToken';
const SW_PATH = '/firebase-messaging-sw.js';
const SW_SCOPE = '/firebase-cloud-messaging-push-scope';

let unregistering = false;

if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (!user) unregistering = false;
  });
}

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

export async function obtainDeviceToken(): Promise<string | null> {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey || !('serviceWorker' in navigator) || !(await isSupported())) return null;
  const registration = await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE });
  return (await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: registration })) || null;
}

export async function registerDevice(uid: string, knownTokens: string[]): Promise<string | null> {
  if (unregistering) return null;
  const token = await obtainDeviceToken();
  if (!token || unregistering) return null;
  const previous = readStoredToken();
  if (!knownTokens.includes(token)) {
    await setDoc(userSettingsDoc(db, uid), { fcmTokens: arrayUnion(token) }, { merge: true });
  }
  if (previous && previous !== token && knownTokens.includes(previous)) {
    await setDoc(userSettingsDoc(db, uid), { fcmTokens: arrayRemove(previous) }, { merge: true });
  }
  storeToken(token);
  return token;
}

export async function unregisterDevice(uid: string | null): Promise<void> {
  unregistering = true;
  const token = readStoredToken();
  storeToken(null);
  if (!token) return;
  if (uid) {
    await setDoc(userSettingsDoc(db, uid), { fcmTokens: arrayRemove(token) }, { merge: true }).catch(() => {});
  }
  if (await isSupported().catch(() => false)) {
    await deleteToken(getMessaging(app)).catch(() => {});
  }
}
