'use client';

import { Check, X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxHeight?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  maxHeight = '80vh',
  footer,
  children,
}: BottomSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center">
      <button
        type="button"
        aria-label="閉じる"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-overlay)] motion-safe:animate-[fade-in_200ms_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxHeight }}
        className="relative z-75 flex w-full max-w-content-max flex-col overflow-hidden rounded-t-lg border border-b-0 border-border bg-elevated pt-2.5 pb-5 outline-none motion-safe:animate-[sheet-in_300ms_var(--ease-out-soft)]"
      >
        <span aria-hidden="true" className="mx-auto mb-3 h-1 w-8 rounded-full bg-border" />

        <div className="flex items-start gap-2 border-b border-border px-4 pb-3.5">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-h2 text-fg">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 truncate text-body text-fg-secondary">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="-mr-2.5 flex size-tap-min shrink-0 items-center justify-center rounded-md text-fg-secondary"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-2">{children}</div>
        {footer && <div className="px-4 pt-3">{footer}</div>}
      </div>
    </div>
  );
}

export interface SheetOptionRowProps {
  icon?: ReactNode;
  label: string;
  selected: boolean;
  hasSubmenu?: boolean;
  trailing?: ReactNode;
  onSelect: () => void;
}

export function SheetOptionRow({
  icon,
  label,
  selected,
  trailing,
  onSelect,
}: SheetOptionRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`flex h-14 w-full items-center gap-3 rounded-md px-3 text-left transition-colors duration-150 ${
        selected ? 'bg-chip' : 'hover:bg-base-50'
      }`}
    >
      {icon}
      <span className={`flex-1 truncate text-body ${selected ? 'font-bold text-base-700' : 'text-fg'}`}>
        {label}
      </span>
      {trailing}
      {selected && <Check size={20} strokeWidth={2.6} aria-hidden="true" className="shrink-0 text-base-700" />}
    </button>
  );
}
