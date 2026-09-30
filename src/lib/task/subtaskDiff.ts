import type { Subtask } from '@/types/domain';

export const TEMP_ID_PREFIX = 'tmp-';

export interface SubtaskDraft {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface SubtaskDiff {
  creates: SubtaskDraft[];
  updates: SubtaskDraft[];
  deletes: string[];
}

export function isTempId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX);
}

export function createTempId(seed: number): string {
  return `${TEMP_ID_PREFIX}${seed}`;
}

export function toDrafts(subtasks: Subtask[]): SubtaskDraft[] {
  return subtasks.map((subtask, index) => ({
    id: subtask.id,
    title: subtask.title,
    isCompleted: subtask.isCompleted,
    order: index,
  }));
}

export function countSubtasks(drafts: SubtaskDraft[]): { done: number; total: number } {
  return {
    done: drafts.filter((draft) => draft.isCompleted).length,
    total: drafts.length,
  };
}

export function diffSubtasks(initial: Subtask[], next: SubtaskDraft[]): SubtaskDiff {
  const previous = new Map(initial.map((subtask) => [subtask.id, subtask]));
  const diff: SubtaskDiff = { creates: [], updates: [], deletes: [] };

  next.forEach((draft, index) => {
    const ordered = { ...draft, order: index };
    const existing = previous.get(draft.id);

    if (!existing || isTempId(draft.id)) {
      diff.creates.push(ordered);
      return;
    }

    if (
      existing.title !== ordered.title ||
      existing.isCompleted !== ordered.isCompleted ||
      existing.order !== ordered.order
    ) {
      diff.updates.push(ordered);
    }
  });

  const keep = new Set(next.map((draft) => draft.id));
  for (const subtask of initial) {
    if (!keep.has(subtask.id)) diff.deletes.push(subtask.id);
  }

  return diff;
}
