import {
  METRIC_LABELS,
  METRIC_UNITS,
  OPERATOR_LABELS,
  type Trigger,
  type TriggerCondition,
} from '@/lib/types';

export function conditionLabel(c: TriggerCondition): string {
  if (c.metric === 'SEVERE') return 'Severe weather';
  return `${METRIC_LABELS[c.metric]} ${OPERATOR_LABELS[c.operator]} ${c.threshold}`;
}

/** Human-readable summary of a trigger's conditions joined by its logic. */
export function conditionText(t: Trigger): string {
  const joiner = t.conditionLogic === 'OR' ? ' or ' : ' and ';
  return t.conditions.map(conditionLabel).join(joiner);
}

export function shortMetric(metric: TriggerCondition['metric']): string {
  return METRIC_LABELS[metric].split(' ')[0];
}

export function formatObserved(c: TriggerCondition): string | null {
  if (c.lastObservedValue == null) return null;
  if (c.metric === 'SEVERE') return `code ${c.lastObservedValue}`;
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
export function statusReason(t: Trigger): string | null {
  if (!t.isActive || t.lastEvaluatedAt == null) return null;
  const matched = overallMatched(t);
  if (matched == null) return null;
  if (!matched) return 'conditions not met';
  if (t.state === 'FIRED' && t.lastFiredAt) {
    const next = new Date(
      new Date(t.lastFiredAt).getTime() + t.cooldownMin * 60_000,
    );
    if (next.getTime() > Date.now()) {
      const hhmm = next.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `conditions met · cooldown until ${hhmm}`;
    }
  }
  return 'conditions met';
}
