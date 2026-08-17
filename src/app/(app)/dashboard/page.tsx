'use client';

import { useState } from 'react';
import { useApiLimits, useClearTriggers, useTriggers } from '@/lib/hooks';
import { TriggerForm } from '@/components/trigger-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { TriggerList } from '@/components/triggers/trigger-list';
import type { Paginated, Trigger } from '@/lib/types';
import { useT } from '@/i18n';

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-12 w-12"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M24 14v2M24 32v2M14 24h2M32 24h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const t = useT();
  const triggers = useTriggers();
  const { maxTriggersPerUser } = useApiLimits();
  const clearAll = useClearTriggers();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Trigger | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const count = triggers.data?.items.length ?? 0;
  const atLimit = !!triggers.data && count >= maxTriggersPerUser;
  const editorOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">
            {t('triggers.title')}
          </h1>
          <p className="mt-0.5 text-sm text-ink-dim">
            {triggers.data
              ? t('triggers.count', { count, max: maxTriggersPerUser })
              : t('triggers.subtitle')}
          </p>
        </div>
        {!editorOpen && (
          <div className="flex shrink-0 items-center gap-2">
            {count > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                disabled={clearAll.isPending}
                className="focus-ring rounded-xl border border-danger-bg px-3.5 py-2 text-xs font-medium text-red-400 transition-colors hover:border-red-500/30 hover:bg-danger-bg disabled:opacity-50"
              >
                {t('triggers.clearAll')}
              </button>
            )}
            <button
              onClick={() => setCreating(true)}
              disabled={atLimit}
              title={
                atLimit
                  ? `Trigger limit reached (max ${maxTriggersPerUser})`
                  : undefined
              }
              className="focus-ring flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-sky-500"
            >
              <PlusIcon />
              {t('triggers.new')}
            </button>
          </div>
        )}
      </div>

      {creating && <TriggerForm onDone={() => setCreating(false)} />}
      {editing && (
        <TriggerForm initial={editing} onDone={() => setEditing(null)} />
      )}

      <AsyncBoundary
        query={triggers}
        skeleton={<SkeletonList count={3} label="Loading triggers" />}
        isEmpty={(page: Paginated<Trigger>) => page.items.length === 0}
        empty={
          editorOpen ? null : (
            <EmptyState
              icon={<RadarIcon />}
              title="No triggers yet"
              hint="Create your first weather alert above"
            />
          )
        }
      >
        {(page) => (
          <TriggerList
            triggers={page.items}
            onEdit={(t) => {
              setCreating(false);
              setEditing(t);
            }}
          />
        )}
      </AsyncBoundary>

      <ConfirmDialog
        open={confirmClear}
        title="Delete all triggers?"
        message="This permanently removes every trigger you've created. This action cannot be undone."
        confirmLabel="Delete all"
        danger
        pending={clearAll.isPending}
        onConfirm={() =>
          clearAll.mutate(undefined, {
            onSettled: () => setConfirmClear(false),
          })
        }
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
