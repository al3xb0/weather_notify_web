'use client';

import { useEffect, useRef, useState } from 'react';
import { GeoResult, searchCities } from '@/lib/geocode';

export function CityAutocomplete({
  initial,
  onSelect,
}: {
  initial?: string;
  onSelect: (geo: GeoResult) => void;
}) {
  const [query, setQuery] = useState(initial ?? '');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const skip = useRef(true);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    const handle = setTimeout(() => {
      void searchCities(query).then((r) => {
        setResults(r);
        setOpen(r.length > 0);
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a city…"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
      />
      {open && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((r, i) => (
            <li key={`${r.latitude}-${r.longitude}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setQuery(r.name);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
              >
                {r.name}
                <span className="text-slate-500">
                  {r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
