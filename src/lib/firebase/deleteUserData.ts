import { getDocs, writeBatch, type DocumentReference, type Firestore } from 'firebase/firestore';

import { chunk } from '@/lib/firebase/batch';
import { listsCollection, subtasksCollection, tasksCollection, userSettingsDoc } from '@/lib/firebase/refs';

export async function collectUserDocuments(firestore: Firestore, uid: string): Promise<DocumentReference[]> {
  const [taskSnapshot, listSnapshot] = await Promise.all([
    getDocs(tasksCollection(firestore, uid)),
    getDocs(listsCollection(firestore, uid)),
  ]);
  const subtaskSnapshots = await Promise.all(
    taskSnapshot.docs.map((task) => getDocs(subtasksCollection(firestore, uid, task.id))),
  );

  return [
    ...subtaskSnapshots.flatMap((snapshot) => snapshot.docs.map((doc) => doc.ref)),
    ...taskSnapshot.docs.map((doc) => doc.ref),
    ...listSnapshot.docs.map((doc) => doc.ref),
    userSettingsDoc(firestore, uid),
  ];
}

export async function deleteUserData(firestore: Firestore, uid: string): Promise<number> {
  const refs = await collectUserDocuments(firestore, uid);
  for (const group of chunk(refs)) {
    const batch = writeBatch(firestore);
    for (const ref of group) batch.delete(ref);
    await batch.commit();
  }
  return refs.length;
}
