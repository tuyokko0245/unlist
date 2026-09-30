'use client';

import { Plus } from 'lucide-react';

export interface FabProps {
  onClick: () => void;
  pulse?: boolean;
  label?: string;
}

export function Fab({ onClick, pulse = false, label = 'タスクを追加' }: FabProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`fixed right-4 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+16px)] z-40 flex size-fab-size items-center justify-center rounded-full bg-base-300 text-on-base shadow-fab transition-[background-color,transform] duration-150 hover:bg-base-400 active:scale-95 active:bg-base-500 md:right-8 md:bottom-8 ${
        pulse ? 'motion-safe:animate-[fab-pulse_1.2s_ease-in-out_2]' : ''
      }`}
    >
      <Plus size={28} strokeWidth={2.6} aria-hidden="true" />
    </button>
  );
}
