'use client';

export interface ToggleProps {
  id: string;
  checked: boolean;
  label: string;
  description?: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ id, checked, label, disabled = false, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-[30px] w-[52px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-150 disabled:opacity-40 ${
        checked ? 'bg-base-600' : 'bg-border'
      }`}
    >
      <span
        className={`size-6 rounded-full bg-white shadow-sm transition-transform duration-150 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
