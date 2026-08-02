import type { Role } from '@/lib/types';

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        role === 'ADMIN'
          ? 'bg-sky-500/10 text-sky-400'
          : 'bg-elevated text-ink-dim'
      }`}
    >
      {role}
    </span>
  );
}
