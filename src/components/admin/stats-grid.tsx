'use client';

import { useAdminStats } from '@/lib/hooks';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';

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
  const t = useT();
  const stats = useAdminStats();
  return (
    <AsyncBoundary
      query={stats}
      skeleton={
        <div
          role="status"
          aria-busy="true"
          aria-label={t('admin.stats.loading')}
          className={GRID}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-20 rounded-2xl border border-rim bg-card/50"
            />
          ))}
        </div>
      }
    >
      {(data) => (
        <div className={GRID}>
          <StatCard label={t('admin.stats.users')} value={data.users} />
          <StatCard
            label={t('admin.stats.verified')}
            value={data.verifiedUsers}
          />
          <StatCard label={t('admin.stats.admins')} value={data.admins} />
          <StatCard label={t('admin.stats.triggers')} value={data.triggers} />
          <StatCard
            label={t('admin.stats.activeTriggers')}
            value={data.activeTriggers}
          />
          <StatCard
            label={t('admin.stats.pinnedCities')}
            value={data.pinnedCities}
          />
          <StatCard
            label={t('admin.stats.notificationsSent')}
            value={data.notificationsSent}
          />
          <StatCard
            label={t('admin.stats.notificationsFailed')}
            value={data.notificationsFailed}
          />
        </div>
      )}
    </AsyncBoundary>
  );
}
