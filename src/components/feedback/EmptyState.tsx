import type { ReactNode } from 'react';

import { Button } from '@/components/primitives/Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center gap-3 px-6 py-16 text-center"
    >
      {icon}
      <p className="text-h3 text-fg">{title}</p>
      {description && <p className="text-body text-fg-secondary">{description}</p>}
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
