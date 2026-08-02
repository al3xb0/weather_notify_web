import { z } from 'zod';
import {
  CHANNEL_LABELS,
  METRIC_LABELS,
  OPERATOR_LABELS,
  type ApiLimits,
  type Channel,
  type Metric,
  type Operator,
} from '@/lib/types';

export const METRICS = Object.keys(METRIC_LABELS) as [Metric, ...Metric[]];
export const OPERATORS = Object.keys(OPERATOR_LABELS) as [
  Operator,
  ...Operator[],
];
export const CHANNELS = Object.keys(CHANNEL_LABELS) as [Channel, ...Channel[]];

const conditionSchema = z.object({
  metric: z.enum(METRICS),
  operator: z.enum(OPERATORS),
  threshold: z.number({ error: 'Enter a number' }),
});

/**
 * Built from the server's own limits rather than a second set of numbers.
 * The schema stays hand-written — this is UX validation, a different job from
 * the API contract — but the bounds it enforces are the API's.
 */
export function buildTriggerSchema(limits: ApiLimits) {
  return z.object({
    name: z.string().trim().min(1, 'Name is required'),
    city: z.string().min(1, 'Pick a city from the list'),
    latitude: z.number({ error: 'Pick a city from the list' }),
    longitude: z.number({ error: 'Pick a city from the list' }),
    conditions: z
      .array(conditionSchema)
      .min(1, 'Add at least one condition')
      .max(
        limits.maxConditionsPerTrigger,
        `Up to ${limits.maxConditionsPerTrigger} conditions`,
      ),
    conditionLogic: z.enum(['AND', 'OR']),
    channels: z.array(z.enum(CHANNELS)).min(1, 'Select at least one channel'),
    cooldownMin: z
      .number({ error: 'Enter a number' })
      .min(
        limits.minCooldownMin,
        `Minimum cooldown is ${limits.minCooldownMin} minutes`,
      )
      .max(
        limits.maxCooldownMin,
        `Maximum cooldown is ${limits.maxCooldownMin} minutes`,
      ),
  });
}

export type TriggerFormData = z.infer<ReturnType<typeof buildTriggerSchema>>;

export const DEFAULT_CONDITION = {
  metric: 'TEMPERATURE',
  operator: 'GT',
  threshold: 30,
} as const;
