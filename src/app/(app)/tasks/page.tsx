import type { Metadata } from 'next';

import { PlaceholderScreen } from '@/components/layout/PlaceholderScreen';

export const metadata: Metadata = {
  title: 'すべてのタスク - ウンlist',
};

export default function TasksPage() {
  return <PlaceholderScreen title="すべてのタスク" activeTab="tasks" note="Tier 2 #4 で実装します" />;
}
