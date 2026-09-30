'use client';

import { ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/primitives/Button';

export interface CompletedSectionProps {
  count: number;
  defaultExpanded?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  children: ReactNode;
}

export function CompletedSection({
  count,
  defaultExpanded = false,
  hasMore = false,
  onLoadMore,
  children,
}: CompletedSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (count === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex h-13 w-full items-center gap-2 rounded-card border border-border bg-surface px-4 text-left text-[15px] font-bold text-fg-tertiary"
      >
        <ChevronRight
          size={16}
          strokeWidth={2.4}
          aria-hidden="true"
          className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        />
        完了済み ({count}件)
      </button>
      {expanded && (
        <>
          <div className="flex flex-col gap-2">{children}</div>
          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-1">
              <Button size="sm" variant="secondary" onClick={onLoadMore}>
                もっと見る
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
