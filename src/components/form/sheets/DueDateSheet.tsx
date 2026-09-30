'use client';

import { useState } from 'react';

import { BottomSheet, SheetOptionRow } from '@/components/layout/BottomSheet';
import { Button } from '@/components/primitives/Button';
import {
  createJstDate,
  formatDueDate,
  fromDueDateInputValue,
  jstParts,
  toDueDateInputValue,
} from '@/lib/date/dueDate';

function addJstDays(base: Date, days: number): Date {
  const { year, month, day } = jstParts(base);
  return createJstDate(year, month, day + days);
}

interface DueDateSheetProps {
  isOpen: boolean;
  value: Date | null;
  onSelect: (dueDate: Date | null) => void;
  onClose: () => void;
}

function DueDateSheetBody({
  value,
  onSelect,
  onClose,
}: Omit<DueDateSheetProps, 'isOpen'>) {
  const [input, setInput] = useState(toDueDateInputValue(value));

  const today = new Date();
  const quickOptions: { label: string; date: Date | null }[] = [
    { label: '今日', date: addJstDays(today, 0) },
    { label: '明日', date: addJstDays(today, 1) },
    { label: '来週', date: addJstDays(today, 7) },
    { label: 'なし', date: null },
  ];

  const commit = (date: Date | null) => {
    onSelect(date);
    onClose();
  };

  return (
    <>
      <div role="listbox" aria-label="期限日" className="flex flex-col gap-0.5">
        {quickOptions.map((option) => (
          <SheetOptionRow
            key={option.label}
            label={option.label}
            selected={
              option.date === null
                ? value === null
                : value !== null && toDueDateInputValue(option.date) === toDueDateInputValue(value)
            }
            trailing={
              option.date ? (
                <span className="text-meta text-fg-tertiary">{formatDueDate(option.date)}</span>
              ) : undefined
            }
            onSelect={() => commit(option.date)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 px-3 pt-3">
        <label htmlFor="due-date-input" className="text-meta text-fg-secondary">
          日付を指定
        </label>
        <input
          id="due-date-input"
          type="date"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="input-field h-13 w-full rounded-md border border-border bg-input px-3.5 text-body text-fg"
        />
        <Button size="lg" fullWidth onClick={() => commit(fromDueDateInputValue(input))}>
          決定
        </Button>
      </div>
    </>
  );
}

export function DueDateSheet({ isOpen, value, onSelect, onClose }: DueDateSheetProps) {
  if (!isOpen) return null;

  return (
    <BottomSheet isOpen onClose={onClose} title="期限日">
      <DueDateSheetBody value={value} onSelect={onSelect} onClose={onClose} />
    </BottomSheet>
  );
}
