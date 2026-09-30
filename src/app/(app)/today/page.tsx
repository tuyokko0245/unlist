import type { Metadata } from 'next';

import { TodayView } from '@/components/task/TodayView';

export const metadata: Metadata = {
  title: '今日のタスク - ウンlist',
};

export default function TodayPage() {
  return <TodayView />;
}
