import type { Metadata } from 'next';
import { Suspense } from 'react';

import { NewTaskScreen } from '@/components/form/NewTaskScreen';

export const metadata: Metadata = {
  title: 'タスクを追加 - ウンlist',
};

export default function NewTaskPage() {
  return (
    <Suspense>
      <NewTaskScreen />
    </Suspense>
  );
}
