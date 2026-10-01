'use client';

import { Check } from 'lucide-react';

export interface ColorSwatchProps {
  color: string;
  colorName: string;
  isSelected: boolean;
  isTabStop?: boolean;
  onSelect: () => void;
}

export function ColorSwatch({
  color,
  colorName,
  isSelected,
  isTabStop = false,
  onSelect,
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={colorName}
      tabIndex={isTabStop ? 0 : -1}
      onClick={onSelect}
      style={{ background: color }}
      className={`flex size-tap-min items-center justify-center rounded-sm transition-transform duration-100 active:scale-95 ${
        isSelected ? 'border-2 border-fg' : 'border border-border'
      }`}
    >
      {isSelected && <Check size={20} strokeWidth={3} aria-hidden="true" className="text-on-base" />}
    </button>
  );
}
