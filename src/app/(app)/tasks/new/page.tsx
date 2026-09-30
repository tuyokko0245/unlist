import type { Metadata } from 'next';

import { QuickTaskForm } from '@/components/form/QuickTaskForm';

export const metadata: Metadata = {
  title: 'タスクを追加 - ウンlist',
};

export default function NewTaskPage() {
  return <QuickTaskForm />;
}
