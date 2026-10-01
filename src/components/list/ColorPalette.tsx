'use client';

import { useId, useRef, type KeyboardEvent } from 'react';

import { ColorSwatch } from '@/components/list/ColorSwatch';
import { PALETTE_20 } from '@/constants/palette';

export interface ColorPaletteProps {
  value: string;
  onChange: (color: string) => void;
  columns?: number;
  label: string;
}

const ARROW_STEP: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
};

export function ColorPalette({ value, onChange, columns = 5, label }: ColorPaletteProps) {
  const labelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIndex = PALETTE_20.findIndex(
    (color) => color.light.toUpperCase() === value.toUpperCase(),
  );

  const focusAt = (index: number) => {
    const swatches = containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    swatches?.[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEP[event.key] ?? (event.key === 'ArrowDown' ? columns : event.key === 'ArrowUp' ? -columns : 0);
    if (step === 0) return;

    event.preventDefault();
    const current = selectedIndex === -1 ? 0 : selectedIndex;
    const next = (current + step + PALETTE_20.length) % PALETTE_20.length;
    onChange(PALETTE_20[next].light);
    focusAt(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className="pl-1 text-meta text-fg-secondary">
        {label}
      </p>
      <div
        ref={containerRef}
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        className="grid justify-items-center gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {PALETTE_20.map((color, index) => (
          <ColorSwatch
            key={color.light}
            color={color.light}
            colorName={color.name}
            isSelected={index === selectedIndex}
            isTabStop={index === (selectedIndex === -1 ? 0 : selectedIndex)}
            onSelect={() => onChange(color.light)}
          />
        ))}
      </div>
    </div>
  );
}
