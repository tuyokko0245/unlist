export function SkeletonTaskCard({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="skeleton-card min-h-card-min-h rounded-card border border-border"
        />
      ))}
    </div>
  );
}
