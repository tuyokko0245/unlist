import { CloudOff } from 'lucide-react';

export function OfflineBanner({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-90 flex items-center justify-center gap-2 bg-chip px-4 py-2 text-meta font-bold text-offline"
    >
      <CloudOff size={16} aria-hidden="true" />
      オフラインです。変更は接続後に同期されます
    </div>
  );
}
