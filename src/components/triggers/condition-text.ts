import {
  METRIC_UNITS,
  OPERATOR_LABELS,
  type Trigger,
  type TriggerCondition,
} from '@/lib/types';
import type { Translate } from '@/i18n';

/*
 * These build sentences, so they take the translator rather than importing a
 * label map: the strings differ per language and the operators do not — `>` is
 * `>` everywhere, which is why OPERATOR_LABELS stays where it is.
 */

export function conditionLabel(t: Translate, c: TriggerCondition): string {
  if (c.metric === 'SEVERE') return t('metric.SEVERE');
  return `${t(`metric.${c.metric}`)} ${OPERATOR_LABELS[c.operator]} ${c.threshold}`;
}

/** Human-readable summary of a trigger's conditions joined by its logic. */
export function conditionText(t: Translate, trigger: Trigger): string {
  const joiner =
    trigger.conditionLogic === 'OR'
      ? ` ${t('logic.or')} `
      : ` ${t('logic.and')} `;
  return trigger.conditions.map((c) => conditionLabel(t, c)).join(joiner);
}

export function shortMetric(
  t: Translate,
  metric: TriggerCondition['metric'],
): string {
  return t(`metricShort.${metric}`);
}

export function formatObserved(
  t: Translate,
  c: TriggerCondition,
): string | null {
  if (c.lastObservedValue == null) return null;
  if (c.metric === 'SEVERE')
    return t('status.code', { value: c.lastObservedValue });
  const v = Math.round(c.lastObservedValue * 10) / 10;
  return `${v}${METRIC_UNITS[c.metric]}`;
}

function overallMatched(t: Trigger): boolean | null {
  const flags = t.conditions.map((c) => c.lastMatched);
  if (flags.some((f) => f == null)) return null;
  return t.conditionLogic === 'OR' ? flags.some(Boolean) : flags.every(Boolean);
}

/**
 * Client-side explanation of why a trigger is or isn't firing, derived purely
 * from the latest observations the watcher recorded.
 */
export function statusReason(t: Translate, trigger: Trigger): string | null {
  if (!trigger.isActive || trigger.lastEvaluatedAt == null) return null;
  const matched = overallMatched(trigger);
  if (matched == null) return null;
  if (!matched) return t('status.notMet');
  if (trigger.state === 'FIRED' && trigger.lastFiredAt) {
    const next = new Date(
      new Date(trigger.lastFiredAt).getTime() + trigger.cooldownMin * 60_000,
    );
    if (next.getTime() > Date.now()) {
      const hhmm = next.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return t('status.cooldownUntil', { time: hhmm });
    }
  }
  return t('status.met');
}
