import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rim bg-card/50 py-16 text-center">
      {icon && <div className="mb-4 text-ink-dim/40">{icon}</div>}
      <p className="font-heading text-sm font-medium text-ink-dim">{title}</p>
      {hint && <p className="mt-1 text-xs text-ink-dim/60">{hint}</p>}
    </div>
  );
}
