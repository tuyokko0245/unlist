'use client';

import { Star } from 'lucide-react';

export interface StarButtonProps {
  isStarred: boolean;
  taskTitle: string;
  size?: 20 | 24;
  onToggle: (next: boolean) => void;
}

export function StarButton({ isStarred, taskTitle, size = 20, onToggle }: StarButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isStarred}
      aria-label={`${taskTitle}のスター`}
      onClick={() => onToggle(!isStarred)}
      className="-mr-2.5 flex size-tap-min shrink-0 items-center justify-center rounded-full"
    >
      <Star
        size={size}
        aria-hidden="true"
        className={`transition-transform duration-150 ${
          isStarred ? 'fill-star text-star' : 'text-fg-tertiary'
        }`}
      />
    </button>
  );
}
