import { z } from 'zod';
import {
  CHANNEL_LABELS,
  METRIC_LABELS,
  OPERATOR_LABELS,
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

export const MAX_CONDITIONS = 5;

const conditionSchema = z.object({
  metric: z.enum(METRICS),
  operator: z.enum(OPERATORS),
  threshold: z.number({ error: 'Enter a number' }),
});

export const triggerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  city: z.string().min(1, 'Pick a city from the list'),
  latitude: z.number({ error: 'Pick a city from the list' }),
  longitude: z.number({ error: 'Pick a city from the list' }),
  conditions: z
    .array(conditionSchema)
    .min(1, 'Add at least one condition')
    .max(MAX_CONDITIONS, `Up to ${MAX_CONDITIONS} conditions`),
  conditionLogic: z.enum(['AND', 'OR']),
  channels: z.array(z.enum(CHANNELS)).min(1, 'Select at least one channel'),
  cooldownMin: z
    .number({ error: 'Enter a number' })
    .min(10, 'Minimum cooldown is 10 minutes'),
});

export type TriggerFormData = z.infer<typeof triggerSchema>;

export const DEFAULT_CONDITION = {
  metric: 'TEMPERATURE',
  operator: 'GT',
  threshold: 30,
} as const;
