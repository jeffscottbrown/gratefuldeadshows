/**
 * React island: filter shows by year / country / city using URL params.
 * Reads/writes params via the browser History API — no server round-trip
 * since this is a static site.
 */
import { useState, useMemo, useEffect } from 'react';
import ShowList, { type ShowRow } from './ShowList';

interface Props {
  shows: ShowRow[];
  years: { year: string; count: number }[];
  countries: { country: string; count: number }[];
  cities: { city: string; country: string }[];
}

function getParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) ?? '';
}

function pushParams(params: Record<string, string>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const qs = q.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

export default function SearchPage({ shows, years, countries, cities }: Props) {
  const [year, setYear] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [ready, setReady] = useState(false);

  // Read initial values from URL on mount
  useEffect(() => {
    setYear(getParam('year'));
    setCountry(getParam('country'));
    setCity(getParam('city'));
    setReady(true);
  }, []);

  // Keep URL in sync with state
  useEffect(() => {
    if (ready) pushParams({ year, country, city });
  }, [year, country, city, ready]);

  const hasFilter = year || country || city;

  const filtered = useMemo(() => {
    if (!hasFilter) return [];
    return shows.filter((s) => {
      if (year && s.year !== year) return false;
      if (country && s.country.toLowerCase() !== country.toLowerCase()) return false;
      if (city && s.city.toLowerCase() !== city.toLowerCase()) return false;
      return true;
    });
  }, [shows, year, country, city, hasFilter]);

  const selectCls =
    'bg-dead-bg border border-dead-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-dead-gold';

  return (
    <>
      {/* Filter bar */}
      <div className="mb-8 p-5 rounded-xl border border-dead-border bg-dead-card flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
            <option value="">Any year</option>
            {years.map((y) => (
              <option key={y.year} value={y.year}>{y.year} ({y.count})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls}>
            <option value="">Any country</option>
            {countries.map((c) => (
              <option key={c.country} value={c.country}>{c.country} ({c.count})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">City</label>
          <input
            type="text"
            list="city-list"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Any city"
            className={`${selectCls} placeholder-gray-600`}
          />
          <datalist id="city-list">
            {cities.map((c) => (
              <option key={`${c.city}-${c.country}`} value={c.city} />
            ))}
          </datalist>
        </div>

        {hasFilter && (
          <button
            onClick={() => { setYear(''); setCountry(''); setCity(''); }}
            className="px-4 py-2 rounded-lg border border-dead-border bg-dead-bg text-gray-400 text-sm font-medium hover:text-white hover:bg-dead-card transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {hasFilter ? (
        <>
          <p className="text-gray-400 mb-6 text-sm">
            {filtered.length} show{filtered.length !== 1 ? 's' : ''} found
            {year ? ` in ${year}` : ''}
            {country ? ` in ${country}` : ''}
            {city ? ` in ${city}` : ''}
          </p>
          <ShowList shows={filtered} showFilter />
        </>
      ) : (
        <p className="text-gray-500 italic text-center py-16">
          Select a year, country, or city to browse shows.
        </p>
      )}
    </>
  );
}
