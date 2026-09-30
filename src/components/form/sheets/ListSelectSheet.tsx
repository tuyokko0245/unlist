'use client';

import { BottomSheet, SheetOptionRow } from '@/components/layout/BottomSheet';
import type { List } from '@/types/domain';

export function ListSelectSheet({
  isOpen,
  lists,
  selectedId,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  lists: List[];
  selectedId: string;
  onSelect: (listId: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="リストを選択">
      <div role="listbox" aria-label="リスト" className="flex flex-col gap-0.5">
        {lists.map((list) => (
          <SheetOptionRow
            key={list.id}
            icon={
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full"
                style={{ background: list.color }}
              />
            }
            label={list.name}
            selected={list.id === selectedId}
            onSelect={() => {
              onSelect(list.id);
              onClose();
            }}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
