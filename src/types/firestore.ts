import type { Timestamp } from 'firebase/firestore';

import type { Priority, RepeatConfig, TaskStatus } from './domain';

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

export interface TaskDoc {
  title: string;
  listId: string;
  status: TaskStatus;
  priority: Priority;
  isStarred: boolean;
  dueDate: Timestamp | null;
  reminder: { datetime: Timestamp; isEnabled: boolean } | null;
  repeat: RepeatConfig | null;
  memo: string;
  completedAt: Timestamp | null;
  subtaskDone?: number;
  subtaskTotal?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SubtaskDoc {
  title: string;
  isCompleted: boolean;
  order: number;
  createdAt: Timestamp;
}
