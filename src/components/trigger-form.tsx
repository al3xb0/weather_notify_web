'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  city: z.string().min(1, 'Pick a city from the list'),
  latitude: z.number({ error: 'Pick a city from the list' }),
  longitude: z.number({ error: 'Pick a city from the list' }),
  metric: z.enum(METRICS),
  operator: z.enum(OPERATORS),
  threshold: z.number({ error: 'Enter a number' }),
  channels: z.array(z.enum(CHANNELS)).min(1, 'Select at least one channel'),
  cooldownMin: z
    .number({ error: 'Enter a number' })
    .min(5, 'Minimum cooldown is 5 minutes'),
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
      metric: initial?.metric ?? 'TEMPERATURE',
      operator: initial?.operator ?? 'GT',
      threshold: initial?.threshold ?? 30,
      channels: initial?.channels ?? ['TELEGRAM'],
      cooldownMin: initial?.cooldownMin ?? 60,
    },
  });

  const metric = useWatch({ control, name: 'metric' });
  const city = useWatch({ control, name: 'city' });
  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const channels = useWatch({ control, name: 'channels' }) ?? [];
  const isSevere = metric === 'SEVERE';

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const input: TriggerInput = {
      name: data.name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      metric: data.metric,
      operator: isSevere ? 'EQ' : data.operator,
      threshold: isSevere ? 0 : data.threshold,
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
              Metric
            </label>
            <SelectWrapper>
              <select {...register('metric')} className={selectClass}>
                {METRICS.map((m) => (
                  <option key={m} value={m}>
                    {METRIC_LABELS[m]}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>

          {!isSevere && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
                  Operator
                </label>
                <SelectWrapper>
                  <select {...register('operator')} className={selectClass}>
                    {OPERATORS.map((o) => (
                      <option key={o} value={o}>
                        {OPERATOR_LABELS[o]}
                      </option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
                  Threshold
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('threshold', { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.threshold && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.threshold.message}
                  </p>
                )}
              </div>
            </>
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
