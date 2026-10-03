export type TaskStatus = 'todo' | 'completed';
export type Priority = 'high' | 'medium' | 'low';
export type RepeatType = 'daily' | 'weekly' | 'monthly';

export interface List {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderConfig {
  datetime: Date;
  isEnabled: boolean;
  sentAt?: Date | null;
}

export interface RepeatConfig {
  type: RepeatType;
  weekdays: number[];
  monthDay: number | null;
}

export interface Task {
  id: string;
  title: string;
  listId: string;
  status: TaskStatus;
  priority: Priority;
  isStarred: boolean;
  dueDate: Date | null;
  reminder: ReminderConfig | null;
  repeat: RepeatConfig | null;
  memo: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
}

export interface UserSettings {
  baseColor: string;
  notificationsEnabled: boolean;
  fcmTokens: string[];
}

export interface TaskView extends Task {
  list: Pick<List, 'id' | 'name' | 'color'>;
  dueState: 'overdue' | 'today' | 'upcoming' | 'none';
  subtaskCount: { done: number; total: number };
}

export const MAX_TASK_TITLE = 100;
export const MAX_SUBTASK_TITLE = 100;
export const MAX_MEMO = 1000;
export const MAX_LIST_NAME = 20;
