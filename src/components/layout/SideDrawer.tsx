'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function SideDrawer({ isOpen, onClose, title = 'リスト', children }: SideDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    const trigger = document.activeElement as HTMLElement | null;
    panel?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const targets = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (targets.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = targets[0];
      const last = targets[targets.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
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
    <div className="fixed inset-0 z-60 md:hidden">
      <button
        type="button"
        aria-label="ドロワーを閉じる"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-overlay)] motion-safe:animate-[fade-in_250ms_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="app-drawer absolute inset-y-0 left-0 z-65 flex w-drawer-w max-w-[85vw] flex-col overflow-y-auto border-r border-border outline-none motion-safe:animate-[drawer-in_250ms_var(--ease-out-soft)]"
      >
        <div className="flex h-header shrink-0 items-center pr-2 pl-4">
          <h2 id={titleId} className="flex-1 text-h2 text-fg">
            {title}
          </h2>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="flex size-tap-min items-center justify-center rounded-md text-fg-secondary"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
