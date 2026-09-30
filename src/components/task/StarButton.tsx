'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

export interface StarButtonProps {
  isStarred: boolean;
  taskTitle: string;
  size?: 20 | 24;
  onToggle: (next: boolean) => void;
}

export function StarButton({ isStarred, taskTitle, size = 20, onToggle }: StarButtonProps) {
  const [animate, setAnimate] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={isStarred}
      aria-label={`${taskTitle}のスター`}
      onClick={() => {
        setAnimate(true);
        onToggle(!isStarred);
      }}
      className="-mr-2.5 flex size-tap-min shrink-0 items-center justify-center rounded-full"
    >
      <Star
        key={isStarred ? 'on' : 'off'}
        size={size}
        aria-hidden="true"
        className={[
          isStarred ? 'fill-star text-star' : 'text-fg-tertiary',
          animate
            ? isStarred
              ? 'motion-safe:animate-[star-on_200ms_ease-out]'
              : 'motion-safe:animate-[star-off_150ms_ease-out]'
            : '',
        ].join(' ')}
      />
    </button>
  );
}
