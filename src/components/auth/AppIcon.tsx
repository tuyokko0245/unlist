export function AppIcon({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const isSmall = size === 'sm';
  return (
    <div
      className={`flex items-center justify-center bg-icon-bg ${
        isSmall ? 'size-8 rounded-xs' : 'size-22 rounded-xl shadow-icon'
      }`}
    >
      <svg
        width={isSmall ? 20 : 48}
        height={isSmall ? 20 : 48}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-icon-mark"
      >
        <polyline points="3 6.5 5 8.5 8.5 4.5" />
        <polyline points="3 13 5 15 8.5 11" />
        <polyline points="3 19.5 5 21.5 8.5 17.5" />
        <line x1="12" y1="6.5" x2="21" y2="6.5" />
        <line x1="12" y1="13" x2="21" y2="13" />
        <line x1="12" y1="19.5" x2="21" y2="19.5" />
      </svg>
    </div>
  );
}
