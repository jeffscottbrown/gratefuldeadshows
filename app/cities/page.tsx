import type { Metadata } from 'next';
import Link from 'next/link';
import { getCities } from '@/lib/db';

export const metadata: Metadata = { title: 'Shows by City' };

export default function CitiesPage() {
  const cities = getCities();

  // Group alphabetically
  const byLetter = new Map<string, typeof cities>();
  for (const c of cities) {
    const letter = c.city[0]?.toUpperCase() ?? '#';
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push(c);
  }
  const letters = Array.from(byLetter.keys()).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-2">Shows by City</h1>
      <p className="text-gray-400 mb-6">{cities.length} cities across the globe</p>

      {/* Letter index */}
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
            {byLetter.get(letter)!.map(({ city, country, count }) => (
              <Link
                key={`${city}-${country}`}
                href={`/cities/${encodeURIComponent(city)}`}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-dead-border bg-dead-card hover:border-dead-gold hover:bg-dead-card-hover transition-all group"
              >
                <span className="text-sm text-white group-hover:text-dead-gold transition-colors truncate">
                  {city}
                  <span className="text-gray-500 text-xs ml-1">({country})</span>
                </span>
                <span className="text-xs text-gray-500 ml-2 shrink-0">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
