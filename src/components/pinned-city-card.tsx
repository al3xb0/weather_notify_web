'use client';

import { useWeather } from '@/lib/hooks';
import { describeWeather } from '@/lib/weather';
import type { PinnedCity } from '@/lib/types';

export function PinnedCityCard({
  city,
  active,
  removing,
  onSelect,
  onRemove,
}: {
  city: PinnedCity;
  active: boolean;
  removing: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { data, isLoading } = useWeather(city.latitude, city.longitude);
  const cond = data ? describeWeather(data.current.weatherCode) : null;

  return (
    <div
      className={`group relative cursor-pointer rounded-2xl border bg-card p-4 transition-shadow hover:shadow-lg hover:shadow-black/30 ${
        active ? 'border-sky-500/60' : 'border-rim'
      }`}
      onClick={onSelect}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={removing}
        aria-label="Unpin city"
        className="absolute right-2 top-2 text-ink-dim/40 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <p className="truncate pr-5 font-heading text-sm font-semibold text-ink">
        {city.name}
      </p>
      <p className="truncate text-xs text-ink-dim/70">
        {city.admin1 ? `${city.admin1}, ` : ''}
        {city.country ?? ''}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {isLoading || !data || !cond ? (
          <div className="h-8 w-20 animate-pulse rounded-lg bg-elevated" />
        ) : (
          <>
            <span className="text-2xl leading-none" aria-hidden="true">
              {cond.emoji}
            </span>
            <span className="font-heading text-2xl font-bold text-ink">
              {Math.round(data.current.temperature)}°
            </span>
            <span className="text-xs text-ink-dim">{cond.label}</span>
          </>
        )}
      </div>
    </div>
  );
}
