import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';

import type { ListDoc, TaskDoc, UserSettingsDoc } from '@/types/firestore';

export function listsCollection(firestore: Firestore, uid: string): CollectionReference<ListDoc> {
  return collection(firestore, 'users', uid, 'lists') as CollectionReference<ListDoc>;
}

export function userSettingsDoc(
  firestore: Firestore,
  uid: string,
): DocumentReference<UserSettingsDoc> {
  return doc(firestore, 'users', uid, 'settings', 'userSettings') as DocumentReference<UserSettingsDoc>;
}

export function tasksCollection(firestore: Firestore, uid: string): CollectionReference<TaskDoc> {
  return collection(firestore, 'users', uid, 'tasks') as CollectionReference<TaskDoc>;
}

export function taskDoc(firestore: Firestore, uid: string, taskId: string): DocumentReference<TaskDoc> {
  return doc(firestore, 'users', uid, 'tasks', taskId) as DocumentReference<TaskDoc>;
}
