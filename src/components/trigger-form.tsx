'use client';

import { useState } from 'react';
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

const METRICS  = Object.keys(METRIC_LABELS)   as Metric[];
const OPERATORS = Object.keys(OPERATOR_LABELS) as Operator[];
const CHANNELS  = Object.keys(CHANNEL_LABELS)  as Channel[];

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

  const [name, setName]           = useState(initial?.name ?? '');
  const [city, setCity]           = useState(initial?.city ?? '');
  const [lat, setLat]             = useState<number | null>(initial?.latitude ?? null);
  const [lon, setLon]             = useState<number | null>(initial?.longitude ?? null);
  const [metric, setMetric]       = useState<Metric>(initial?.metric ?? 'TEMPERATURE');
  const [operator, setOperator]   = useState<Operator>(initial?.operator ?? 'GT');
  const [threshold, setThreshold] = useState<number>(initial?.threshold ?? 30);
  const [channels, setChannels]   = useState<Channel[]>(initial?.channels ?? ['TELEGRAM']);
  const [cooldownMin, setCooldownMin] = useState<number>(initial?.cooldownMin ?? 60);

  const isSevere = metric === 'SEVERE';

  const toggleChannel = (c: Channel) =>
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !city.trim() || lat === null || lon === null) {
      setError('Please provide a name and pick a city from the list.');
      return;
    }
    if (channels.length === 0) {
      setError('Select at least one channel.');
      return;
    }
    const input: TriggerInput = {
      name,
      city,
      latitude: lat,
      longitude: lon,
      metric,
      operator: isSevere ? 'EQ' : operator,
      threshold: isSevere ? 0 : threshold,
      channels,
      cooldownMin,
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
  };

  const selectClass =
    'w-full appearance-none rounded-xl border border-rim bg-base py-2.5 pl-3.5 pr-8 text-sm text-ink outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10';

  const inputClass =
    'w-full rounded-xl border border-rim bg-base px-3.5 py-2.5 text-sm text-ink placeholder-ink-dim/50 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10';

  return (
    <form
      onSubmit={submit}
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
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Berlin heat wave"
            className={inputClass}
          />
        </div>

        {/* City */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
            City
          </label>
          <CityAutocomplete
            initial={city}
            onSelect={(g) => {
              setCity(g.name);
              setLat(g.latitude);
              setLon(g.longitude);
            }}
          />
          {lat !== null && (
            <p className="mt-1.5 text-xs text-ink-dim">
              <span className="text-sky-400">{city}</span>
              {' '}
              <span className="text-ink-dim/50">
                ({lat.toFixed(2)}, {lon?.toFixed(2)})
              </span>
            </p>
          )}
        </div>

        {/* Metric / Operator / Threshold */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
              Metric
            </label>
            <SelectWrapper>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as Metric)}
                className={selectClass}
              >
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
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as Operator)}
                    className={selectClass}
                  >
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
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>

        {/* Channels — pill toggles */}
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
                    checked={active}
                    onChange={() => toggleChannel(c)}
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
        </div>

        {/* Cooldown */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
            Cooldown (minutes)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={cooldownMin}
              onChange={(e) => setCooldownMin(Number(e.target.value))}
              className="w-28 rounded-xl border border-rim bg-base px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
            />
            <span className="text-xs text-ink-dim">
              min between repeated alerts
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-danger-bg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={create.isPending || update.isPending}
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
