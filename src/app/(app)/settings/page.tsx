import type { Metadata } from 'next';

import { PlaceholderScreen } from '@/components/layout/PlaceholderScreen';

export const metadata: Metadata = {
  title: '設定 - ウンlist',
};

export default function SettingsPage() {
  return <PlaceholderScreen title="設定" activeTab="settings" note="Tier 4 #9 で実装します" />;
}
