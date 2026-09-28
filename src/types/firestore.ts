import type { Timestamp } from 'firebase/firestore';

export interface ListDoc {
  name: string;
  color: string;
  isDefault: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserSettingsDoc {
  baseColor: string;
  notificationsEnabled: boolean;
  fcmToken: string | null;
}
