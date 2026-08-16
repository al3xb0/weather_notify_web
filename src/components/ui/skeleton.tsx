/**
 * Loading placeholders. The shapes below were copied inline in eight places
 * with slightly different heights and radii; presets keep a skeleton looking
 * like the thing it stands in for.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-elevated ${className}`}
    />
  );
}

/** Placeholder for a bordered card — trigger rows, pinned cities, panels. */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl border border-rim bg-card/50 ${className || 'h-24'}`}
    />
  );
}

/** Placeholder for a compact list row — notification history, tables. */
export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl border border-rim bg-card/50 ${className || 'h-16'}`}
    />
  );
}

/**
 * A stack of identical placeholders. Marked busy for assistive tech so the
 * wait is announced once, rather than each bar being read as content.
 */
export function SkeletonList({
  count = 3,
  variant = 'card',
  className = '',
  label = 'Loading',
}: {
  count?: number;
  variant?: 'card' | 'row';
  className?: string;
  label?: string;
}) {
  const Item = variant === 'row' ? SkeletonRow : SkeletonCard;
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="space-y-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} className={className} />
      ))}
    </div>
  );
}
