'use client';

import { CHANNEL_LABELS, type Trigger } from '@/lib/types';
import { ActiveToggle } from './active-toggle';
import { TriggerActions } from './trigger-actions';
import {
  conditionText,
  formatObserved,
  shortMetric,
  statusReason,
} from './condition-text';

function glowClass(t: Trigger): string {
  if (!t.isActive) return 'card-paused';
  return t.state === 'FIRED' ? 'card-fired' : 'card-armed';
}

export interface TriggerCardProps {
  trigger: Trigger;
  confirming: boolean;
  deleting: boolean;
  toggling: boolean;
  testing: boolean;
  cooling: boolean;
  cooldownRemaining: number;
  onToggleActive: () => void;
  onTest: () => void;
  onEdit: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function TriggerCard({
  trigger: t,
  confirming,
  deleting,
  toggling,
  testing,
  cooling,
  cooldownRemaining,
  onToggleActive,
  onTest,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: TriggerCardProps) {
  const observed = t.conditions.filter((c) => formatObserved(c) !== null);
  const reason = statusReason(t);

  return (
    <li
      className={`flex list-none items-start justify-between gap-4 rounded-2xl border border-rim bg-card p-4 transition-shadow hover:shadow-lg hover:shadow-black/30 ${glowClass(t)}`}
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
              aria-hidden="true"
              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                t.state === 'FIRED' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            {t.state}
          </span>

          <ActiveToggle
            active={t.isActive}
            name={t.name}
            pending={toggling}
            onToggle={onToggleActive}
          />
          {!t.isActive && (
            <span className="text-xs font-medium text-ink-dim">paused</span>
          )}
        </div>

        <p className="text-sm text-ink-dim">
          <span className="text-sky-400">{t.city}</span>
          <span aria-hidden="true" className="mx-1.5 text-ink-dim/40">
            ·
          </span>
          {conditionText(t)}
        </p>

        {observed.length > 0 && (
          <p className="flex flex-wrap items-center gap-2 text-xs">
            {observed.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 font-medium text-sky-300"
              >
                {shortMetric(c.metric)}: {formatObserved(c)}
              </span>
            ))}
            {reason && <span className="text-ink-dim/70">{reason}</span>}
          </p>
        )}

        <p className="text-xs text-ink-dim/70">
          {t.channels.map((c) => CHANNEL_LABELS[c]).join(', ')}
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          cooldown {t.cooldownMin}m
          {t.lastFiredAt && (
            <>
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              last fired {new Date(t.lastFiredAt).toLocaleDateString()}
            </>
          )}
        </p>
      </div>

      <TriggerActions
        trigger={t}
        confirming={confirming}
        deleting={deleting}
        testing={testing}
        cooling={cooling}
        cooldownRemaining={cooldownRemaining}
        onTest={onTest}
        onEdit={onEdit}
        onAskDelete={onAskDelete}
        onConfirmDelete={onConfirmDelete}
        onCancelDelete={onCancelDelete}
      />
    </li>
  );
}
