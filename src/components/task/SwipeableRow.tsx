'use client';

import { Trash2 } from 'lucide-react';
import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

const THRESHOLD = 80;
const ANGLE_RATIO = 1.5;

export interface SwipeableRowProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  disabled?: boolean;
  children: ReactNode;
}

export function SwipeableRow({
  onSwipeLeft,
  onSwipeRight,
  threshold = THRESHOLD,
  disabled = false,
  children,
}: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const decided = useRef(false);

  const reset = () => {
    start.current = null;
    decided.current = false;
    setSwiping(false);
    setOffset(0);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.pointerType === 'mouse') return;
    start.current = { x: event.clientX, y: event.clientY };
    decided.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;

    if (!decided.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dx) < Math.abs(dy) * ANGLE_RATIO) {
        start.current = null;
        return;
      }
      decided.current = true;
      setSwiping(true);
    }

    setOffset(dx);
  };

  const handlePointerUp = () => {
    if (!start.current || !decided.current) {
      reset();
      return;
    }
    const current = offset;
    reset();
    if (current <= -threshold) onSwipeLeft();
    else if (current >= threshold) onSwipeRight();
  };

  const revealDelete = offset < 0;

  return (
    <div className="relative touch-pan-y">
      {swiping && offset !== 0 && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center rounded-card px-5 text-meta font-bold ${
            revealDelete
              ? 'justify-end bg-danger-bg text-danger'
              : 'justify-start bg-chip text-base-700'
          }`}
        >
          {revealDelete ? (
            <span className="flex items-center gap-1.5">
              <Trash2 size={18} aria-hidden="true" />
              削除
            </span>
          ) : (
            <span>完了</span>
          )}
        </div>
      )}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={reset}
        style={{ transform: `translateX(${offset}px)` }}
        className={swiping ? '' : 'transition-transform duration-200 ease-out-soft'}
      >
        {children}
      </div>
    </div>
  );
}
