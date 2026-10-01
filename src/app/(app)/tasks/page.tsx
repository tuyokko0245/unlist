import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TaskListScreen } from '@/components/task/TaskListScreen';

export const metadata: Metadata = {
  title: 'タスク一覧 - ウンlist',
};

export default function TasksPage() {
  return (
    <Suspense>
      <TaskListScreen />
    </Suspense>
  );
}
