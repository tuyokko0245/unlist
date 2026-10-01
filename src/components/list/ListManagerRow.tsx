'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { CSSProperties } from 'react';

import type { List } from '@/types/domain';

export interface ListManagerRowProps {
  list: List;
  taskCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ListManagerRow({ list, taskCount, onEdit, onDelete }: ListManagerRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
  });

  const style: CSSProperties = {
    '--list-color': list.color || undefined,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    boxShadow: isDragging ? 'var(--shadow-drag)' : undefined,
  } as CSSProperties;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`task-card flex h-16 items-center gap-2.5 py-0 pr-1 pl-[18px] ${
        isDragging ? 'scale-[1.03] opacity-95' : ''
      }`}
    >
      <button
        type="button"
        aria-label={`${list.name}を並び替える`}
        {...attributes}
        {...listeners}
        className="-ml-1.5 flex size-tap-min shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-base-700 active:cursor-grabbing"
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onEdit}
        aria-label={list.isDefault ? `${list.name}のカラーを変更` : `${list.name}を編集`}
        className="flex min-w-0 flex-1 items-center gap-2.5 self-stretch rounded-md text-left"
      >
        <span
          aria-hidden="true"
          className="size-4 shrink-0 rounded-full"
          style={{ background: list.color }}
        />
        <span className="min-w-0 flex-1 truncate text-body-lg text-fg">{list.name}</span>
      </button>

      {list.isDefault && (
        <span className="flex h-[26px] shrink-0 items-center rounded-[13px] bg-chip px-2.5 text-meta font-bold text-base-700">
          デフォルト
        </span>
      )}

      <span className="flex h-[26px] shrink-0 items-center rounded-[13px] bg-surface px-2.5 text-meta text-fg-tertiary">
        {taskCount}件
      </span>

      {list.isDefault ? (
        <span className="w-2 shrink-0" aria-hidden="true" />
      ) : (
        <button
          type="button"
          aria-label={`${list.name}を削除`}
          onClick={onDelete}
          className="flex size-tap-min shrink-0 items-center justify-center rounded-md text-danger"
        >
          <Trash2 size={20} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
