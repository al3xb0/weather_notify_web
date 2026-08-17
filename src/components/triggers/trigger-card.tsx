'use client';

import { type Trigger } from '@/lib/types';
import { useT } from '@/i18n';
import { ActiveToggle } from './active-toggle';
import { TriggerActions } from './trigger-actions';
import {
  conditionText,
  formatObserved,
  shortMetric,
  statusReason,
} from './condition-text';

function glowClass(trigger: Trigger): string {
  if (!trigger.isActive) return 'card-paused';
  return trigger.state === 'FIRED' ? 'card-fired' : 'card-armed';
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
  trigger,
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
  const t = useT();
  const observed = trigger.conditions.filter(
    (c) => formatObserved(t, c) !== null,
  );
  const reason = statusReason(t, trigger);

  return (
    <li
      className={`flex list-none items-start justify-between gap-4 rounded-2xl border border-rim bg-card p-4 transition-shadow hover:shadow-lg hover:shadow-black/30 ${glowClass(trigger)}`}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-semibold text-ink">
            {trigger.name}
          </span>

          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              trigger.state === 'FIRED'
                ? 'bg-fired-bg text-amber-400'
                : 'bg-armed-bg text-emerald-400'
            }`}
          >
            <span
              aria-hidden="true"
              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                trigger.state === 'FIRED' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            {trigger.state}
          </span>

          <ActiveToggle
            active={trigger.isActive}
            name={trigger.name}
            pending={toggling}
            onToggle={onToggleActive}
          />
          {!trigger.isActive && (
            <span className="text-xs font-medium text-ink-dim">
              {t('triggers.paused')}
            </span>
          )}
        </div>

        <p className="text-sm text-ink-dim">
          <span className="text-sky-400">{trigger.city}</span>
          <span aria-hidden="true" className="mx-1.5 text-ink-dim/40">
            ·
          </span>
          {conditionText(t, trigger)}
        </p>

        {observed.length > 0 && (
          <p className="flex flex-wrap items-center gap-2 text-xs">
            {observed.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 font-medium text-sky-300"
              >
                {shortMetric(t, c.metric)}: {formatObserved(t, c)}
              </span>
            ))}
            {reason && <span className="text-ink-dim/70">{reason}</span>}
          </p>
        )}

        <p className="text-xs text-ink-dim/70">
          {trigger.channels.map((c) => t(`channel.${c}`)).join(', ')}
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          {t('triggers.cooldownShort', { minutes: trigger.cooldownMin })}
          {trigger.lastFiredAt && (
            <>
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              {t('triggers.lastFired', {
                date: new Date(trigger.lastFiredAt).toLocaleDateString(),
              })}
            </>
          )}
        </p>
      </div>

      <TriggerActions
        trigger={trigger}
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
