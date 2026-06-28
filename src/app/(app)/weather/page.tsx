'use client';

import { useState } from 'react';
import { CityAutocomplete } from '@/components/city-autocomplete';
import { WeatherDetail } from '@/components/weather-detail';
import { PinnedCityCard } from '@/components/pinned-city-card';
import {
  useAddPinnedCity,
  usePinnedCities,
  useRemovePinnedCity,
} from '@/lib/hooks';
import { apiError } from '@/lib/api';
import type { GeoResult } from '@/lib/geocode';
import type { PinnedCity } from '@/lib/types';

const MAX_PINNED = 12;

interface SelectedLocation {
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
}

function fromGeo(g: GeoResult): SelectedLocation {
  return {
    name: g.name,
    country: g.country ?? null,
    admin1: g.admin1 ?? null,
    latitude: g.latitude,
    longitude: g.longitude,
  };
}

function fromPinned(c: PinnedCity): SelectedLocation {
  return {
    name: c.name,
    country: c.country,
    admin1: c.admin1,
    latitude: c.latitude,
    longitude: c.longitude,
  };
}

function sameSpot(
  a: SelectedLocation,
  b: { latitude: number; longitude: number },
): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.02 &&
    Math.abs(a.longitude - b.longitude) < 0.02
  );
}

function locationSubtitle(loc: SelectedLocation): string {
  return [loc.admin1, loc.country].filter(Boolean).join(', ');
}

export default function WeatherPage() {
  const [selected, setSelected] = useState<SelectedLocation | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { data: pinned, isLoading } = usePinnedCities();
  const addPin = useAddPinnedCity();
  const removePin = useRemovePinnedCity();

  const pinnedMatch =
    selected && pinned ? pinned.find((c) => sameSpot(selected, c)) : undefined;
  const atLimit = !!pinned && pinned.length >= MAX_PINNED;

  const handlePin = async () => {
    if (!selected) return;
    setMsg(null);
    try {
      await addPin.mutateAsync({
        name: selected.name,
        country: selected.country ?? undefined,
        admin1: selected.admin1 ?? undefined,
        latitude: selected.latitude,
        longitude: selected.longitude,
      });
    } catch (e) {
      setMsg(apiError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Weather</h1>
        <p className="mt-0.5 text-sm text-ink-dim">
          Look up any city and pin the ones you watch
        </p>
      </div>

      <div className="max-w-md">
        <CityAutocomplete onSelect={(g) => setSelected(fromGeo(g))} />
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate font-heading text-lg font-semibold text-ink">
                {selected.name}
              </h2>
              {locationSubtitle(selected) && (
                <p className="truncate text-sm text-ink-dim">
                  {locationSubtitle(selected)}
                </p>
              )}
            </div>
            {pinnedMatch ? (
              <button
                onClick={() => removePin.mutate(pinnedMatch.id)}
                disabled={removePin.isPending}
                className="shrink-0 rounded-xl border border-rim px-3.5 py-2 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:opacity-50"
              >
                ★ Pinned
              </button>
            ) : (
              <button
                onClick={handlePin}
                disabled={addPin.isPending || atLimit}
                title={atLimit ? `Pin limit reached (max ${MAX_PINNED})` : undefined}
                className="shrink-0 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {addPin.isPending ? 'Pinning…' : '☆ Pin city'}
              </button>
            )}
          </div>
          {msg && <p className="text-xs font-medium text-red-400">{msg}</p>}
          <WeatherDetail
            latitude={selected.latitude}
            longitude={selected.longitude}
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-ink-dim">
            Pinned cities
          </h2>
          {!!pinned && pinned.length > 0 && (
            <span className="text-xs text-ink-dim/60">
              {pinned.length} of {MAX_PINNED}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-rim bg-card/50" />
            ))}
          </div>
        )}

        {pinned && pinned.length === 0 && (
          <div className="rounded-2xl border border-dashed border-rim bg-card/50 py-10 text-center text-sm text-ink-dim/70">
            Search a city above and pin it to keep an eye on its weather here.
          </div>
        )}

        {pinned && pinned.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((c) => (
              <PinnedCityCard
                key={c.id}
                city={c}
                active={!!selected && sameSpot(selected, c)}
                removing={removePin.isPending && removePin.variables === c.id}
                onSelect={() => setSelected(fromPinned(c))}
                onRemove={() => removePin.mutate(c.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
