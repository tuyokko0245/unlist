'use client';

import { BottomSheet, SheetOptionRow } from '@/components/layout/BottomSheet';
import { PriorityBadge } from '@/components/task/TaskMeta';
import type { Priority } from '@/types/domain';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const LABELS: Record<Priority, string> = { high: '高', medium: '中', low: '低' };

export function PrioritySheet({
  isOpen,
  selected,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  selected: Priority;
  onSelect: (priority: Priority) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="優先度">
      <div role="listbox" aria-label="優先度" className="flex flex-col gap-0.5">
        {PRIORITIES.map((priority) => (
          <SheetOptionRow
            key={priority}
            label={LABELS[priority]}
            selected={priority === selected}
            trailing={<PriorityBadge priority={priority} />}
            onSelect={() => {
              onSelect(priority);
              onClose();
            }}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
