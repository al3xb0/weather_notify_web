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

const METRICS = Object.keys(METRIC_LABELS) as Metric[];
const OPERATORS = Object.keys(OPERATOR_LABELS) as Operator[];
const CHANNELS = Object.keys(CHANNEL_LABELS) as Channel[];

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

  const [name, setName] = useState(initial?.name ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [lat, setLat] = useState<number | null>(initial?.latitude ?? null);
  const [lon, setLon] = useState<number | null>(initial?.longitude ?? null);
  const [metric, setMetric] = useState<Metric>(initial?.metric ?? 'TEMPERATURE');
  const [operator, setOperator] = useState<Operator>(initial?.operator ?? 'GT');
  const [threshold, setThreshold] = useState<number>(initial?.threshold ?? 30);
  const [channels, setChannels] = useState<Channel[]>(
    initial?.channels ?? ['TELEGRAM'],
  );
  const [cooldownMin, setCooldownMin] = useState<number>(
    initial?.cooldownMin ?? 60,
  );

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

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-lg font-semibold">
        {initial ? 'Edit trigger' : 'New trigger'}
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">City</label>
        <CityAutocomplete
          initial={city}
          onSelect={(g) => {
            setCity(g.name);
            setLat(g.latitude);
            setLon(g.longitude);
          }}
        />
        {lat !== null && (
          <p className="mt-1 text-xs text-slate-500">
            {city} ({lat.toFixed(2)}, {lon?.toFixed(2)})
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
        {!isSevere && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Operator</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as Operator)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {OPERATORS.map((o) => (
                  <option key={o} value={o}>
                    {OPERATOR_LABELS[o]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Threshold</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Channels</label>
        <div className="flex flex-wrap gap-3">
          {CHANNELS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={channels.includes(c)}
                onChange={() => toggleChannel(c)}
              />
              {CHANNEL_LABELS[c]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Cooldown (minutes)
        </label>
        <input
          type="number"
          min={1}
          value={cooldownMin}
          onChange={(e) => setCooldownMin(Number(e.target.value))}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={create.isPending || update.isPending}
          className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {initial ? 'Save' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
