'use client';

import { Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { BottomSheet } from '@/components/layout/BottomSheet';
import { Button } from '@/components/primitives/Button';
import { jstParts } from '@/lib/date/dueDate';
import { isValidRepeat } from '@/lib/repeat/nextDueDate';
import type { RepeatConfig, RepeatType } from '@/types/domain';

type RepeatKind = 'none' | RepeatType;

const KINDS: { kind: RepeatKind; label: string }[] = [
  { kind: 'none', label: 'なし' },
  { kind: 'daily', label: '毎日' },
  { kind: 'weekly', label: '毎週' },
  { kind: 'monthly', label: '毎月' },
];

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

interface RepeatSheetProps {
  isOpen: boolean;
  value: RepeatConfig | null;
  dueDate: Date | null;
  onSelect: (repeat: RepeatConfig | null) => void;
  onClose: () => void;
}

function toConfig(kind: RepeatKind, weekdays: number[], monthDay: number): RepeatConfig | null {
  if (kind === 'none') return null;
  if (kind === 'weekly') return { type: 'weekly', weekdays: [...weekdays].sort((a, b) => a - b), monthDay: null };
  if (kind === 'monthly') return { type: 'monthly', weekdays: [], monthDay };
  return { type: 'daily', weekdays: [], monthDay: null };
}

function KindRow({
  label,
  selected,
  expandable,
  onSelect,
}: {
  label: string;
  selected: boolean;
  expandable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex h-14 w-full items-center gap-3 rounded-md px-3 text-left transition-colors duration-150 ${
        selected ? 'bg-chip' : 'hover:bg-base-50'
      }`}
    >
      <span className={`flex-1 text-body ${selected ? 'font-bold text-base-700' : 'text-fg'}`}>{label}</span>
      {selected && <Check size={20} strokeWidth={2.6} aria-hidden="true" className="shrink-0 text-base-700" />}
      {!selected && expandable && (
        <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" className="shrink-0 text-fg-tertiary" />
      )}
    </button>
  );
}

function RepeatSheetBody({ value, dueDate, onSelect, onClose }: Omit<RepeatSheetProps, 'isOpen'>) {
  const reference = jstParts(dueDate ?? new Date());
  const [kind, setKind] = useState<RepeatKind>(value?.type ?? 'none');
  const [weekdays, setWeekdays] = useState<number[]>(() =>
    value?.type === 'weekly' ? value.weekdays : [reference.weekday],
  );
  const [monthDay, setMonthDay] = useState<number>(() =>
    value?.type === 'monthly' && value.monthDay ? value.monthDay : reference.day,
  );

  const draft = toConfig(kind, weekdays, monthDay);
  const canConfirm = isValidRepeat(draft);

  const toggleWeekday = (day: number) => {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day],
    );
  };

  return (
    <div className="flex flex-col pb-1">
      <div role="radiogroup" aria-label="繰り返し" className="flex flex-col gap-0.5">
        {KINDS.map((option) => (
          <div key={option.kind}>
            <KindRow
              label={option.label}
              selected={kind === option.kind}
              expandable={option.kind === 'weekly' || option.kind === 'monthly'}
              onSelect={() => setKind(option.kind)}
            />

            {option.kind === 'weekly' && kind === 'weekly' && (
              <div role="group" aria-label="曜日" className="flex justify-between gap-1 px-1 pt-2.5 pb-3.5">
                {WEEKDAYS.map((label, day) => {
                  const on = weekdays.includes(day);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${label}曜日`}
                      onClick={() => toggleWeekday(day)}
                      className={`flex size-11 items-center justify-center rounded-full border text-body transition-colors duration-150 ${
                        on
                          ? 'border-base-300 bg-base-300 font-bold text-on-base'
                          : 'border-border font-medium text-fg-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {option.kind === 'monthly' && kind === 'monthly' && (
              <div className="px-1 pt-2.5 pb-1">
                <div role="group" aria-label="日付" className="grid grid-cols-7 justify-items-center gap-y-1.5">
                  {MONTH_DAYS.map((day) => {
                    const on = day === monthDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${day}日`}
                        onClick={() => setMonthDay(day)}
                        className={`flex size-11 items-center justify-center rounded-full border text-body transition-colors duration-150 ${
                          on
                            ? 'border-base-300 bg-base-300 font-bold text-on-base'
                            : 'border-border font-medium text-fg-secondary'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {monthDay >= 29 && (
                  <p className="mt-2.5 px-2 text-meta text-fg-tertiary">
                    その日が無い月は月末に繰り越します
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {kind === 'weekly' && weekdays.length === 0 && (
        <p role="status" className="mt-1 px-2 text-meta text-fg-tertiary">
          曜日を1つ以上選んでください
        </p>
      )}

      <div className="pt-3">
        <Button
          size="lg"
          fullWidth
          disabled={!canConfirm}
          onClick={() => {
            onSelect(draft);
            onClose();
          }}
        >
          決定
        </Button>
      </div>
    </div>
  );
}

export function RepeatSheet({ isOpen, value, dueDate, onSelect, onClose }: RepeatSheetProps) {
  if (!isOpen) return null;

  return (
    <BottomSheet isOpen onClose={onClose} title="繰り返し設定">
      <RepeatSheetBody value={value} dueDate={dueDate} onSelect={onSelect} onClose={onClose} />
    </BottomSheet>
  );
}
