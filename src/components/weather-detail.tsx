'use client';

import { useWeather } from '@/lib/hooks';
import { SkeletonCard } from '@/components/ui/skeleton';
import { describeWeather } from '@/lib/weather';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-rim bg-base px-3 py-2.5">
      <p className="text-xs text-ink-dim/70">{label}</p>
      <p className="mt-0.5 font-heading text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function dayLabel(date: string, index: number): string {
  if (index === 0) return 'Today';
  return new Date(date).toLocaleDateString([], { weekday: 'short' });
}

export function WeatherDetail({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { data, isLoading, isError } = useWeather(latitude, longitude);

  if (isLoading) {
    return <SkeletonCard className="h-56" />;
  }
  if (isError || !data) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-500/20 bg-danger-bg/40 p-6 text-sm text-red-400"
      >
        Couldn&apos;t load weather for this location.
      </div>
    );
  }

  const { current, daily } = data;
  const cond = describeWeather(current.weatherCode);

  return (
    <div className="space-y-4 rounded-2xl border border-rim bg-card p-5">
      <div className="flex items-center gap-4">
        <span className="text-5xl leading-none" aria-hidden="true">
          {cond.emoji}
        </span>
        <div>
          <p className="font-heading text-4xl font-bold text-ink">
            {Math.round(current.temperature)}°
            <span className="ml-1 text-base font-medium text-ink-dim">C</span>
          </p>
          <p className="text-sm text-ink-dim">
            {cond.label} · feels like {Math.round(current.apparentTemp)}°
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Humidity" value={`${Math.round(current.humidity)}%`} />
        <Metric label="Wind" value={`${Math.round(current.windSpeed)} km/h`} />
        <Metric label="Precipitation" value={`${current.precipitation} mm`} />
        <Metric label="Feels like" value={`${Math.round(current.apparentTemp)}°C`} />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-dim/60">
          5-day forecast
        </p>
        <div className="grid grid-cols-5 gap-2">
          {daily.map((d, i) => {
            const dc = describeWeather(d.weatherCode);
            return (
              <div
                key={d.date}
                className="flex flex-col items-center gap-1 rounded-xl border border-rim bg-base px-1 py-2.5 text-center"
              >
                <span className="text-xs font-medium text-ink-dim">
                  {dayLabel(d.date, i)}
                </span>
                <span className="text-xl leading-none" aria-hidden="true" title={dc.label}>
                  {dc.emoji}
                </span>
                <span className="text-xs font-semibold text-ink">
                  {Math.round(d.tempMax)}°
                </span>
                <span className="text-xs text-ink-dim/70">
                  {Math.round(d.tempMin)}°
                </span>
                {d.precipitationProbability != null && d.precipitationProbability > 0 && (
                  <span className="text-[10px] text-sky-400">
                    {d.precipitationProbability}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
