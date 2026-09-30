'use client';

import { Check } from 'lucide-react';
import { useRef, useState } from 'react';

import { useConfetti } from '@/hooks/useConfetti';

export interface TaskCheckboxProps {
  checked: boolean;
  taskTitle: string;
  celebrate?: boolean;
  onChange: (checked: boolean) => void;
}

export function TaskCheckbox({ checked, taskTitle, celebrate = true, onChange }: TaskCheckboxProps) {
  const confetti = useConfetti();
  const ref = useRef<HTMLButtonElement>(null);
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    const next = !checked;
    setAnimate(true);
    if (next && celebrate && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      confetti.fire({ x: rect.left + rect.width / 2, y: rect.top });
    }
    onChange(next);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`${taskTitle}を完了${checked ? 'から戻す' : 'にする'}`}
      onClick={handleClick}
      className="-ml-2.5 flex size-tap-min shrink-0 items-center justify-center rounded-full"
    >
      <span
        className={`flex size-6 items-center justify-center rounded-full border-2 border-base-600 transition-colors duration-150 ${
          checked ? 'bg-base-600' : ''
        }`}
      >
        {checked && (
          <Check
            size={14}
            strokeWidth={3.2}
            aria-hidden="true"
            className={`text-on-base ${animate ? 'motion-safe:animate-[check-pop_150ms_ease-out]' : ''}`}
          />
        )}
      </span>
    </button>
  );
}
