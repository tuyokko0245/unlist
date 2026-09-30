import { TriangleAlert } from 'lucide-react';

import { formatDueDate } from '@/lib/date/dueDate';
import { PRIORITY_LABEL } from '@/lib/task/todayView';
import type { Priority, TaskView } from '@/types/domain';

const PRIORITY_CLASS: Record<Priority, string> = {
  high: 'bg-priority-high-bg text-priority-high',
  medium: 'bg-priority-medium-bg text-priority-medium',
  low: 'bg-priority-low-bg text-priority-low',
};

const PRIORITY_MARK: Record<Priority, string> = { high: '●', medium: '◐', low: '○' };

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      aria-label={`優先度: ${PRIORITY_LABEL[priority]}`}
      className={`flex h-6 shrink-0 items-center rounded-[12px] px-2.5 text-badge ${PRIORITY_CLASS[priority]}`}
    >
      {PRIORITY_MARK[priority]} {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function DueDateLabel({
  dueDate,
  state,
}: {
  dueDate: Date | null;
  state: TaskView['dueState'];
}) {
  if (!dueDate || state === 'none') return null;

  const text = formatDueDate(dueDate);
  const tone =
    state === 'overdue' ? 'text-danger' : state === 'today' ? 'text-warning' : 'text-fg-tertiary';

  return (
    <span className={`flex shrink-0 items-center gap-1 text-meta font-bold ${tone}`}>
      {state === 'overdue' && <TriangleAlert size={14} strokeWidth={2.4} aria-hidden="true" />}
      {text}
    </span>
  );
}

export function ListChip({
  name,
  color,
  showDot = true,
}: {
  name: string;
  color: string;
  showDot?: boolean;
}) {
  if (!name) return null;
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-meta text-fg-secondary">
      {showDot && (
        <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ background: color }} />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
