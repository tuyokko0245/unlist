'use client';

import { useState } from 'react';

import { BottomSheet } from '@/components/layout/BottomSheet';
import { Button } from '@/components/primitives/Button';
import { createJstDate, jstParts, toDueDateInputValue } from '@/lib/date/dueDate';
import type { ReminderConfig } from '@/types/domain';

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toTimeValue(date: Date | null): string {
  if (!date) return '09:00';
  const shifted = new Date(date.getTime() + JST_OFFSET_MS);
  return `${String(shifted.getUTCHours()).padStart(2, '0')}:${String(shifted.getUTCMinutes()).padStart(2, '0')}`;
}

function toDateValue(date: Date): string {
  const { year, month, day } = jstParts(date);
  return toDueDateInputValue(createJstDate(year, month, day));
}

function buildDateTime(dateValue: string, timeValue: string): Date | null {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (!year || !month || !day) return null;
  const base = createJstDate(year, month, day);
  return new Date(base.getTime() + (hours ?? 0) * 60 * 60 * 1000 + (minutes ?? 0) * 60 * 1000);
}

interface ReminderSheetProps {
  isOpen: boolean;
  value: ReminderConfig | null;
  dueDate: Date | null;
  onSelect: (reminder: ReminderConfig | null) => void;
  onClose: () => void;
}

function ReminderSheetBody({
  value,
  dueDate,
  onSelect,
  onClose,
}: Omit<ReminderSheetProps, 'isOpen'>) {
  const [dateValue, setDateValue] = useState(() =>
    toDateValue(value?.datetime ?? dueDate ?? new Date()),
  );
  const [timeValue, setTimeValue] = useState(() => toTimeValue(value?.datetime ?? null));

  return (
    <div className="flex flex-col gap-3 px-3 pt-1 pb-1">
      <div className="flex flex-col gap-2">
        <label htmlFor="reminder-date" className="text-meta text-fg-secondary">
          日付
        </label>
        <input
          id="reminder-date"
          type="date"
          value={dateValue}
          onChange={(event) => setDateValue(event.target.value)}
          className="input-field h-13 w-full rounded-md border border-border bg-input px-3.5 text-body text-fg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reminder-time" className="text-meta text-fg-secondary">
          時刻
        </label>
        <input
          id="reminder-time"
          type="time"
          value={timeValue}
          onChange={(event) => setTimeValue(event.target.value)}
          className="input-field h-13 w-full rounded-md border border-border bg-input px-3.5 text-body text-fg"
        />
      </div>

      <p className="text-meta text-fg-tertiary">
        通知の送信は Tier 4 で実装します。ここでの設定は保存されます
      </p>

      <div className="flex flex-col gap-2 pt-1">
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            const datetime = buildDateTime(dateValue, timeValue);
            onSelect(datetime ? { datetime, isEnabled: true } : null);
            onClose();
          }}
        >
          決定
        </Button>
        <Button
          size="lg"
          variant="secondary"
          fullWidth
          onClick={() => {
            onSelect(null);
            onClose();
          }}
        >
          リマインダーなし
        </Button>
      </div>
    </div>
  );
}

export function ReminderSheet({ isOpen, value, dueDate, onSelect, onClose }: ReminderSheetProps) {
  if (!isOpen) return null;

  return (
    <BottomSheet isOpen onClose={onClose} title="リマインダー">
      <ReminderSheetBody value={value} dueDate={dueDate} onSelect={onSelect} onClose={onClose} />
    </BottomSheet>
  );
}
