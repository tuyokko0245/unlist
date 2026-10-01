import type { Metadata } from 'next';

import { ListManagerScreen } from '@/components/list/ListManagerScreen';

export const metadata: Metadata = {
  title: 'リストを管理 - ウンlist',
};

export default function ListsPage() {
  return <ListManagerScreen />;
}
