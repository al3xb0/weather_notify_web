'use client';

import { useState } from 'react';
import { useDeleteTrigger, useTriggers, useUpdateTrigger } from '@/lib/hooks';
import { TriggerForm } from '@/components/trigger-form';
import {
  METRIC_LABELS,
  OPERATOR_LABELS,
  CHANNEL_LABELS,
  Trigger,
} from '@/lib/types';

function conditionText(t: Trigger): string {
  if (t.metric === 'SEVERE') return 'Severe weather detected';
  return `${METRIC_LABELS[t.metric]} ${OPERATOR_LABELS[t.operator]} ${t.threshold}`;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rim bg-card/50 py-16 text-center">
      <svg viewBox="0 0 48 48" fill="none" className="mb-4 h-12 w-12 text-ink-dim/40" aria-hidden="true">
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 14v2M24 32v2M14 24h2M32 24h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="font-heading text-sm font-medium text-ink-dim">No triggers yet</p>
      <p className="mt-1 text-xs text-ink-dim/60">Create your first weather alert above</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl border border-rim bg-card/50" />
      ))}
    </div>
  );
}

function ActiveToggle({
  active,
  pending,
  onToggle,
}: {
  active: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      disabled={pending}
      title={active ? 'Active — click to pause' : 'Paused — click to activate'}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${
        active ? 'bg-sky-500' : 'bg-rim-bright'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useTriggers();
  const del = useDeleteTrigger();
  const update = useUpdateTrigger();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Trigger | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const atLimit = !!data && data.items.length >= 20;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Triggers</h1>
          <p className="mt-0.5 text-sm text-ink-dim">
            {data ? `${data.items.length} of 20 monitor${data.items.length !== 1 ? 's' : ''}` : 'Weather monitors'}
          </p>
        </div>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            disabled={atLimit}
            title={atLimit ? 'Trigger limit reached (max 20)' : undefined}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-sky-500"
          >
            <PlusIcon />
            New trigger
          </button>
        )}
      </div>

      {creating && <TriggerForm onDone={() => setCreating(false)} />}
      {editing && <TriggerForm initial={editing} onDone={() => setEditing(null)} />}

      {isLoading && <LoadingState />}

      {data && data.items.length === 0 && !creating && <EmptyState />}

      <div className="space-y-3">
        {data?.items.map((t) => {
          const glowClass = !t.isActive
            ? 'card-paused'
            : t.state === 'FIRED'
              ? 'card-fired'
              : 'card-armed';

          return (
            <div
              key={t.id}
              className={`flex items-start justify-between gap-4 rounded-2xl border border-rim bg-card p-4 transition-shadow hover:shadow-lg hover:shadow-black/30 ${glowClass}`}
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-sm font-semibold text-ink">
                    {t.name}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.state === 'FIRED'
                        ? 'bg-fired-bg text-amber-400'
                        : 'bg-armed-bg text-emerald-400'
                    }`}
                  >
                    <span
                      className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        t.state === 'FIRED' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    {t.state}
                  </span>

                  <ActiveToggle
                    active={t.isActive}
                    pending={update.isPending && update.variables?.id === t.id}
                    onToggle={() =>
                      update.mutate({ id: t.id, input: { isActive: !t.isActive } })
                    }
                  />
                  {!t.isActive && (
                    <span className="text-xs font-medium text-ink-dim">paused</span>
                  )}
                </div>

                <p className="text-sm text-ink-dim">
                  <span className="text-sky-400">{t.city}</span>
                  <span className="mx-1.5 text-ink-dim/40">·</span>
                  {conditionText(t)}
                </p>

                <p className="text-xs text-ink-dim/60">
                  {t.channels.map((c) => CHANNEL_LABELS[c]).join(', ')}
                  <span className="mx-1.5">·</span>
                  cooldown {t.cooldownMin}m
                  {t.lastFiredAt && (
                    <>
                      <span className="mx-1.5">·</span>
                      last fired {new Date(t.lastFiredAt).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {confirmId === t.id ? (
                  <>
                    <button
                      onClick={() =>
                        del.mutate(t.id, { onSettled: () => setConfirmId(null) })
                      }
                      disabled={del.isPending}
                      className="rounded-lg border border-red-500/30 bg-danger-bg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      disabled={del.isPending}
                      className="rounded-lg border border-rim px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setCreating(false); setEditing(t); }}
                      className="rounded-lg border border-rim px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmId(t.id)}
                      className="rounded-lg border border-danger-bg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-danger-bg hover:border-red-500/30"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
