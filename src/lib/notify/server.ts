import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { FieldValue, getFirestore, type DocumentReference, type Firestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

import type { PushMessage } from '@/lib/notify/morning';
import { isInvalidTokenError } from '@/lib/notify/reminders';

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (process.env.FIRESTORE_EMULATOR_HOST) return initializeApp({ projectId });
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export function adminDb(): Firestore {
  return getFirestore(adminApp());
}

export function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
}

const isDryRun = () => process.env.NOTIFY_DRY_RUN === '1';

export interface DeliveryReport {
  users: number;
  sent: number;
  removedTokens: number;
  failures: number;
  deliveries: { uid: string; title: string; body: string; url: string; sent: number }[];
}

export function createReport(): DeliveryReport {
  return { users: 0, sent: 0, removedTokens: 0, failures: 0, deliveries: [] };
}

export function publicReport(report: DeliveryReport) {
  const { deliveries, ...summary } = report;
  return isDryRun() ? { ...summary, deliveries } : summary;
}

export async function deliver(
  settingsRef: DocumentReference,
  uid: string,
  tokens: string[],
  message: PushMessage & { tag: string },
  report: DeliveryReport,
): Promise<boolean> {
  let invalid: string[];
  let sent: number;
  if (isDryRun()) {
    invalid = tokens.filter((token) => token.startsWith('invalid-'));
    sent = tokens.length - invalid.length;
  } else {
    const response = await getMessaging(adminApp()).sendEachForMulticast({
      tokens,
      data: { title: message.title, body: message.body, url: message.url, tag: message.tag },
      webpush: { headers: { Urgency: 'high', TTL: '3600' } },
    });
    invalid = response.responses
      .map((result, index) => (isInvalidTokenError(result.error?.code) ? tokens[index] : null))
      .filter((token): token is string => token !== null);
    sent = response.successCount;
    report.failures += response.failureCount - invalid.length;
  }

  if (invalid.length) {
    await settingsRef.update({ fcmTokens: FieldValue.arrayRemove(...invalid) });
  }

  report.users += 1;
  report.removedTokens += invalid.length;
  report.sent += sent;
  report.deliveries.push({ uid, title: message.title, body: message.body, url: message.url, sent });
  return sent > 0;
}
