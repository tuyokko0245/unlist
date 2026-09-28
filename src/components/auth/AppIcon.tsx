export function AppIcon() {
  return (
    <div className="flex size-22 items-center justify-center rounded-xl bg-icon-bg shadow-icon">
      <svg
        width="48"
        height="48"
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
