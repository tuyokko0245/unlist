'use client';

import type { ReactNode } from 'react';

import { EmptyState, type EmptyStateProps } from '@/components/feedback/EmptyState';
import { ErrorBanner } from '@/components/feedback/ErrorBanner';
import { SkeletonTaskCard } from '@/components/feedback/SkeletonTaskCard';

export interface TaskListViewProps {
  isEmpty: boolean;
  isLoading: boolean;
  error?: Error | null;
  errorMessage?: string;
  emptyState: EmptyStateProps;
  onRetry?: () => void;
  children: ReactNode;
}

export function TaskListView({
  isEmpty,
  isLoading,
  error,
  errorMessage = 'タスクを読み込めませんでした',
  emptyState,
  onRetry,
  children,
}: TaskListViewProps) {
  if (error) {
    return <ErrorBanner message={errorMessage} onRetry={onRetry ?? (() => {})} />;
  }

  if (isLoading) {
    return <SkeletonTaskCard />;
  }

  if (isEmpty) {
    return <EmptyState {...emptyState} />;
  }

  return <>{children}</>;
}
