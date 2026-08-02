'use client';

import { useAdminStats } from '@/lib/hooks';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { Skeleton } from '@/components/ui/skeleton';

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-4';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-rim bg-card p-4">
      <p className="font-heading text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-dim">{label}</p>
    </div>
  );
}

export function StatsGrid() {
  const stats = useAdminStats();
  return (
    <AsyncBoundary
      query={stats}
      skeleton={
        <div role="status" aria-busy="true" aria-label="Loading stats" className={GRID}>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl border border-rim bg-card/50" />
          ))}
        </div>
      }
    >
      {(data) => (
        <div className={GRID}>
          <StatCard label="Users" value={data.users} />
          <StatCard label="Verified" value={data.verifiedUsers} />
          <StatCard label="Admins" value={data.admins} />
          <StatCard label="Triggers" value={data.triggers} />
          <StatCard label="Active triggers" value={data.activeTriggers} />
          <StatCard label="Pinned cities" value={data.pinnedCities} />
          <StatCard label="Notifications sent" value={data.notificationsSent} />
          <StatCard
            label="Notifications failed"
            value={data.notificationsFailed}
          />
        </div>
      )}
    </AsyncBoundary>
  );
}
