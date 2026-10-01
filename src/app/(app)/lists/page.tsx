import type { Metadata } from 'next';

import { PlaceholderScreen } from '@/components/layout/PlaceholderScreen';

export const metadata: Metadata = {
  title: 'リスト管理 - ウンlist',
};

export default function ListsPage() {
  return <PlaceholderScreen title="リスト管理" activeTab="tasks" note="Tier 2 #5 で実装します" />;
}
