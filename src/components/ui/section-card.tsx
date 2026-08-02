import type { ReactNode } from 'react';

/**
 * The settings panel shell — icon, heading, subtitle, optional status pill —
 * which was written out three times with only the contents differing.
 */
export function SectionCard({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-rim bg-card">
      <div className="flex items-center gap-3 border-b border-rim px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
          {icon}
        </div>
        <div>
          <h2 className="font-heading text-sm font-semibold text-ink">
            {title}
          </h2>
          <p className="text-xs text-ink-dim">{subtitle}</p>
        </div>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-armed-bg px-2.5 py-1 text-xs font-medium text-emerald-400">
      <CheckIcon />
      {children}
    </span>
  );
}

export function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M3 8l3.5 3.5L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
