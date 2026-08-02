'use client';

import { useState } from 'react';
import { useProfile } from '@/lib/hooks';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { SkeletonCard } from '@/components/ui/skeleton';
import { StatsGrid } from '@/components/admin/stats-grid';
import { UserTable } from '@/components/admin/user-table';
import { UserDetail } from '@/components/admin/user-detail';

function AccessDenied() {
  return (
    <div className="rounded-2xl border border-rim bg-card p-8 text-center">
      <p className="font-heading text-lg font-semibold text-ink">
        Access denied
      </p>
      <p className="mt-1 text-sm text-ink-dim">
        You need an admin account to view this page.
      </p>
    </div>
  );
}

export default function AdminPage() {
  const profile = useProfile();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <AsyncBoundary query={profile} skeleton={<SkeletonCard className="h-40" />}>
      {(me) =>
        me.role !== 'ADMIN' ? (
          <AccessDenied />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-ink">
                Admin
              </h1>
              <p className="mt-0.5 text-sm text-ink-dim">
                Manage users, their triggers and view platform metrics
              </p>
            </div>

            <StatsGrid />

            <div className="space-y-3">
              <h2 className="font-heading text-sm font-semibold text-ink-dim">
                Users
              </h2>
              <UserTable
                page={page}
                onPageChange={setPage}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            {selectedId && (
              <UserDetail
                userId={selectedId}
                selfId={me.id}
                onDeleted={() => setSelectedId(null)}
              />
            )}
          </div>
        )
      }
    </AsyncBoundary>
  );
}
