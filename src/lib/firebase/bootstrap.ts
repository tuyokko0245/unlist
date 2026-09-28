import {
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
  type WithFieldValue,
} from 'firebase/firestore';

import { DEFAULT_BASE_COLOR, PRESET_LISTS } from '@/constants/palette';
import type { ListDoc, UserSettingsDoc } from '@/types/firestore';

import { listsCollection, userSettingsDoc } from './refs';

export function buildPresetLists(): Omit<ListDoc, 'createdAt' | 'updatedAt'>[] {
  return PRESET_LISTS.map((preset, order) => ({
    name: preset.name,
    color: preset.color,
    isDefault: preset.isDefault,
    order,
  }));
}

export function buildDefaultSettings(): UserSettingsDoc {
  return {
    baseColor: DEFAULT_BASE_COLOR,
    notificationsEnabled: false,
    fcmToken: null,
  };
}

export async function ensureUserBootstrap(firestore: Firestore, uid: string): Promise<boolean> {
  const settingsRef = userSettingsDoc(firestore, uid);
  const lists = listsCollection(firestore, uid);

  return runTransaction(firestore, async (transaction) => {
    const settings = await transaction.get(settingsRef);
    if (settings.exists()) return false;

    for (const list of buildPresetLists()) {
      const data: WithFieldValue<ListDoc> = {
        ...list,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      transaction.set(doc(lists), data);
    }
    transaction.set(settingsRef, buildDefaultSettings());
    return true;
  });
}
