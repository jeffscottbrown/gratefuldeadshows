/**
 * React island: A-Z city browser with band filter.
 */
import { useState } from 'react';
import BandFilter, { type BandSelection } from './BandFilter';
import { cityUrl } from '@/lib/format';

interface CityEntry {
  city: string;
  state: string;
  country: string;
  gdCount: number;
  dacCount: number;
}

export default function CityList({ cities }: { cities: CityEntry[] }) {
  const [band, setBand] = useState<BandSelection>('both');

  const filtered = cities
    .map((c) => ({
      ...c,
      count: band === 'gd' ? c.gdCount : band === 'dac' ? c.dacCount : c.gdCount + c.dacCount,
    }))
    .filter((c) => c.count > 0);

  const byLetter = new Map<string, typeof filtered>();
  for (const c of filtered) {
    const letter = c.city[0]?.toUpperCase() ?? '#';
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push(c);
  }
  // Sort each letter's cities: primary by city name, secondary by state
  for (const [, entries] of byLetter) {
    entries.sort((a, b) => a.city.localeCompare(b.city) || a.state.localeCompare(b.state));
  }
  const letters = Array.from(byLetter.keys()).sort();

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <BandFilter value={band} onChange={setBand} />
        <span className="text-sm text-gray-500">{filtered.length} cities</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-8">
        {letters.map((l) => (
          <a
            key={l}
            href={`#letter-${l}`}
            className="px-2 py-1 text-xs rounded bg-dead-card text-gray-400 hover:text-dead-gold hover:bg-dead-card-hover transition-colors"
          >
            {l}
          </a>
        ))}
      </div>

      {letters.map((letter) => (
        <div key={letter} id={`letter-${letter}`} className="mb-8 scroll-mt-20">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3 border-b border-dead-border pb-2">
            {letter}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {byLetter.get(letter)!.map(({ city, state, country, count }) => (
              <a
                key={`${city}||${state}||${country}`}
                href={cityUrl(city, state)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-dead-border bg-dead-card hover:border-dead-gold hover:bg-dead-card-hover transition-all group"
              >
                <span className="text-sm text-white group-hover:text-dead-gold transition-colors truncate">
                  {city}{state && <span className="text-gray-500 text-xs ml-1">{state}</span>}
                  {!state && <span className="text-gray-500 text-xs ml-1">({country})</span>}
                </span>
                <span className="text-xs text-gray-500 ml-2 shrink-0">{count}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
