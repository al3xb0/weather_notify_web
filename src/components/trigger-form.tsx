'use client';

import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CityAutocomplete } from '@/components/city-autocomplete';
import { TriggerInput, useCreateTrigger, useUpdateTrigger } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import {
  CHANNEL_LABELS,
  Channel,
  METRIC_LABELS,
  Metric,
  OPERATOR_LABELS,
  Operator,
  Trigger,
} from '@/lib/types';

const METRICS = Object.keys(METRIC_LABELS) as [Metric, ...Metric[]];
const OPERATORS = Object.keys(OPERATOR_LABELS) as [Operator, ...Operator[]];
const CHANNELS = Object.keys(CHANNEL_LABELS) as [Channel, ...Channel[]];

const MAX_CONDITIONS = 5;

const conditionSchema = z.object({
  metric: z.enum(METRICS),
  operator: z.enum(OPERATORS),
  threshold: z.number({ error: 'Enter a number' }),
});

const schema = z.object({
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
type FormData = z.infer<typeof schema>;

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-ink-dim" aria-hidden="true">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function TriggerForm({
  initial,
  onDone,
}: {
  initial?: Trigger;
  onDone: () => void;
}) {
  const create = useCreateTrigger();
  const update = useUpdateTrigger();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      city: initial?.city ?? '',
      latitude: initial?.latitude,
      longitude: initial?.longitude,
      conditions: initial?.conditions?.map((c) => ({
        metric: c.metric,
        operator: c.operator,
        threshold: c.threshold,
      })) ?? [{ metric: 'TEMPERATURE', operator: 'GT', threshold: 30 }],
      conditionLogic: initial?.conditionLogic ?? 'AND',
      channels: initial?.channels ?? ['TELEGRAM'],
      cooldownMin: initial?.cooldownMin ?? 60,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conditions',
  });
  const city = useWatch({ control, name: 'city' });
  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const channels = useWatch({ control, name: 'channels' }) ?? [];
  const watchedConditions = useWatch({ control, name: 'conditions' });
  const logic = useWatch({ control, name: 'conditionLogic' });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const input: TriggerInput = {
      name: data.name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      conditions: data.conditions.map((c) =>
        c.metric === 'SEVERE'
          ? { metric: 'SEVERE' as const, operator: 'EQ' as const, threshold: 0 }
          : c,
      ),
      conditionLogic: data.conditions.length > 1 ? data.conditionLogic : 'AND',
      channels: data.channels,
      cooldownMin: data.cooldownMin,
    };
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, input });
      } else {
        await create.mutateAsync(input);
      }
      onDone();
    } catch (err) {
      setError(apiError(err));
    }
  });

  const selectClass =
    'w-full appearance-none rounded-xl border border-rim bg-base py-2.5 pl-3.5 pr-8 text-sm text-ink outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10';

  const inputClass =
    'w-full rounded-xl border border-rim bg-base px-3.5 py-2.5 text-sm text-ink placeholder-ink-dim/50 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10';

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-rim-bright bg-card p-6 shadow-xl shadow-black/30"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-ink">
          {initial ? 'Edit trigger' : 'New trigger'}
        </h2>
        <button
          type="button"
          onClick={onDone}
          className="text-ink-dim transition-colors hover:text-ink"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
            Name
          </label>
          <input
            {...register('name')}
            placeholder="e.g. Berlin heat wave"
            className={inputClass}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
            City
          </label>
          <CityAutocomplete
            initial={city}
            onSelect={(g) => {
              setValue('city', g.name, { shouldValidate: true });
              setValue('latitude', g.latitude, { shouldValidate: true });
              setValue('longitude', g.longitude, { shouldValidate: true });
            }}
          />
          {latitude !== undefined && longitude !== undefined && (
            <p className="mt-1.5 text-xs text-ink-dim">
              <span className="text-sky-400">{city}</span>
              {' '}
              <span className="text-ink-dim/50">
                ({latitude.toFixed(2)}, {longitude.toFixed(2)})
              </span>
            </p>
          )}
          {(errors.city || errors.latitude) && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.city?.message ?? errors.latitude?.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-dim">
              Conditions
            </label>
            {fields.length > 1 && (
              <div className="flex items-center gap-1 rounded-lg border border-rim p-0.5 text-xs font-semibold">
                {(['AND', 'OR'] as const).map((l) => (
                  <label
                    key={l}
                    className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors ${
                      logic === l
                        ? 'bg-sky-500/15 text-sky-300'
                        : 'text-ink-dim hover:text-ink'
                    }`}
                  >
                    <input
                      type="radio"
                      value={l}
                      {...register('conditionLogic')}
                      className="sr-only"
                    />
                    {l}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {fields.map((field, i) => {
              const severe = watchedConditions?.[i]?.metric === 'SEVERE';
              return (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                    <SelectWrapper>
                      <select
                        {...register(`conditions.${i}.metric` as const)}
                        className={selectClass}
                      >
                        {METRICS.map((m) => (
                          <option key={m} value={m}>
                            {METRIC_LABELS[m]}
                          </option>
                        ))}
                      </select>
                    </SelectWrapper>
                    {severe ? (
                      <div className="flex items-center text-xs text-ink-dim sm:col-span-2">
                        Fires on any severe-weather alert
                      </div>
                    ) : (
                      <>
                        <SelectWrapper>
                          <select
                            {...register(`conditions.${i}.operator` as const)}
                            className={selectClass}
                          >
                            {OPERATORS.map((o) => (
                              <option key={o} value={o}>
                                {OPERATOR_LABELS[o]}
                              </option>
                            ))}
                          </select>
                        </SelectWrapper>
                        <input
                          type="number"
                          step="any"
                          {...register(`conditions.${i}.threshold` as const, {
                            valueAsNumber: true,
                          })}
                          className={inputClass}
                        />
                      </>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="mt-2.5 shrink-0 text-ink-dim transition-colors hover:text-red-400"
                      aria-label="Remove condition"
                    >
                      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {errors.conditions?.message && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.conditions.message}
            </p>
          )}

          {fields.length < MAX_CONDITIONS && (
            <button
              type="button"
              onClick={() =>
                append({ metric: 'TEMPERATURE', operator: 'GT', threshold: 30 })
              }
              className="mt-2 text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300"
            >
              + Add condition
            </button>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-dim">
            Channels
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => {
              const active = channels.includes(c);
              return (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
                      : 'border-rim text-ink-dim hover:border-rim-bright hover:text-ink'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={c}
                    {...register('channels')}
                    className="sr-only"
                  />
                  {active && (
                    <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
                      <path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {CHANNEL_LABELS[c]}
                </label>
              );
            })}
          </div>
          {errors.channels && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.channels.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
            Cooldown (minutes)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              {...register('cooldownMin', { valueAsNumber: true })}
              className="w-28 rounded-xl border border-rim bg-base px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
            />
            <span className="text-xs text-ink-dim">
              min between repeated alerts
            </span>
          </div>
          {errors.cooldownMin && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.cooldownMin.message}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-danger-bg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initial ? 'Save changes' : 'Create trigger'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-rim px-5 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
