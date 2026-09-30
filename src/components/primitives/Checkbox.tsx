'use client';

import { Check } from 'lucide-react';

export interface CheckboxProps {
  id: string;
  checked: boolean;
  label: string;
  labelStrikeThrough?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ id, checked, label, disabled = false, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="-ml-2.5 flex size-tap-min shrink-0 items-center justify-center rounded-full disabled:opacity-40"
    >
      <span
        className={`flex size-[22px] items-center justify-center rounded-full border-2 border-base-600 transition-colors duration-150 ${
          checked ? 'bg-base-600' : ''
        }`}
      >
        {checked && <Check size={13} strokeWidth={3.2} aria-hidden="true" className="text-on-base" />}
      </span>
    </button>
  );
}
