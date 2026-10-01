'use client';

import { ChevronDown, Star } from 'lucide-react';
import { useState } from 'react';

import { BottomSheet, SheetOptionRow } from '@/components/layout/BottomSheet';
import { STATUS_FILTER_LABEL, type StatusFilter } from '@/lib/task/listView';

const STATUS_OPTIONS: StatusFilter[] = ['todo', 'completed', 'all'];

export interface FilterBarProps {
  status: StatusFilter;
  starredOnly: boolean;
  onChangeStatus: (next: StatusFilter) => void;
  onToggleStarred: () => void;
}

const CHIP_BASE =
  'flex h-8 shrink-0 items-center gap-1.5 rounded-[16px] border px-3.5 text-body transition-colors duration-150';

export function FilterBar({
  status,
  starredOnly,
  onChangeStatus,
  onToggleStarred,
}: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="app-bar sticky top-header z-20 border-y border-border">
        <div className="mx-auto flex h-12 w-full max-w-content-max items-center gap-2 overflow-x-auto px-4 md:px-8">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
            className={`${CHIP_BASE} ${
              status === 'todo'
                ? 'border-border bg-surface text-fg'
                : 'border-base-300 bg-base-300 font-bold text-on-base'
            }`}
          >
            {STATUS_FILTER_LABEL[status]}
            <ChevronDown size={14} strokeWidth={2.4} aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-pressed={starredOnly}
            onClick={onToggleStarred}
            className={`${CHIP_BASE} ${
              starredOnly
                ? 'border-base-300 bg-base-300 font-bold text-on-base'
                : 'border-border bg-surface text-fg'
            }`}
          >
            <Star
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className={`text-star ${starredOnly ? 'fill-star' : ''}`}
            />
            スターのみ
          </button>
        </div>
      </div>

      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="ステータスで絞り込む"
      >
        <div role="listbox" aria-label="ステータス" className="flex flex-col gap-0.5">
          {STATUS_OPTIONS.map((option) => (
            <SheetOptionRow
              key={option}
              label={STATUS_FILTER_LABEL[option]}
              selected={option === status}
              onSelect={() => {
                onChangeStatus(option);
                setSheetOpen(false);
              }}
            />
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
