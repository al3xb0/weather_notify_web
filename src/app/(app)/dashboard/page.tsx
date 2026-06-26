'use client';

import { useState } from 'react';
import { useDeleteTrigger, useTriggers } from '@/lib/hooks';
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

export default function DashboardPage() {
  const { data, isLoading } = useTriggers();
  const del = useDeleteTrigger();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Trigger | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Triggers</h1>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700"
          >
            + New trigger
          </button>
        )}
      </div>

      {creating && <TriggerForm onDone={() => setCreating(false)} />}
      {editing && (
        <TriggerForm initial={editing} onDone={() => setEditing(null)} />
      )}

      {isLoading && <p className="text-slate-500">Loading…</p>}

      {data && data.items.length === 0 && !creating && (
        <p className="text-slate-500">
          No triggers yet. Create your first weather alert.
        </p>
      )}

      <div className="grid gap-3">
        {data?.items.map((t) => (
          <div
            key={t.id}
            className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    t.state === 'FIRED'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {t.state}
                </span>
                {!t.isActive && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                    paused
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {t.city} · {conditionText(t)}
              </p>
              <p className="text-xs text-slate-400">
                {t.channels.map((c) => CHANNEL_LABELS[c]).join(', ')} · cooldown{' '}
                {t.cooldownMin}m
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCreating(false);
                  setEditing(t);
                }}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Edit
              </button>
              <button
                onClick={() => del.mutate(t.id)}
                className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
