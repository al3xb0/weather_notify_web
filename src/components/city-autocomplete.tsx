'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { GeoResult, searchCities } from '@/lib/geocode';

export function CityAutocomplete({
  initial,
  onSelect,
  inputId,
  invalid,
  describedBy,
}: {
  initial?: string;
  onSelect: (geo: GeoResult) => void;
  /** Supplied by <Field> so the label and error text point at this input. */
  inputId?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [query, setQuery] = useState(initial ?? '');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [focused, setFocused] = useState(false);
  const skip = useRef(true);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    const handle = setTimeout(() => {
      void searchCities(query).then(setResults);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Suggestions are shown only while the field is focused.
  const open = focused && results.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim"
          aria-hidden="true"
        >
          <circle
            cx="7"
            cy="7"
            r="4.5"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            // Delay so a click on a suggestion still registers.
            blurTimer.current = setTimeout(() => setFocused(false), 120);
          }}
          placeholder="Search a city…"
          className="w-full rounded-xl border border-rim bg-surface py-2.5 pl-9 pr-3.5 text-sm text-ink placeholder-ink-dim/50 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute z-20 mt-1.5 max-h-52 w-full overflow-y-auto overscroll-contain rounded-xl border border-rim-bright bg-elevated shadow-2xl shadow-black/50"
        >
          {results.map((r, i) => (
            <li key={`${r.latitude}-${r.longitude}-${i}`} role="none">
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  onSelect(r);
                  setQuery(r.name);
                  setResults([]);
                  setFocused(false);
                }}
                className="flex w-full items-baseline gap-1.5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-overlay"
              >
                <span className="font-medium text-ink">{r.name}</span>
                <span className="text-xs text-ink-dim">
                  {r.admin1 ? `${r.admin1}, ` : ''}
                  {r.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
