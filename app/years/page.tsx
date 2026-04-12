import type { Metadata } from 'next';
import Link from 'next/link';
import { getYears } from '@/lib/db';

export const metadata: Metadata = { title: 'Shows by Year' };

export default function YearsPage() {
  const years = getYears();

  // Group into decades
  const decades = new Map<string, typeof years>();
  for (const y of years) {
    const decade = y.year.slice(0, 3) + '0s';
    if (!decades.has(decade)) decades.set(decade, []);
    decades.get(decade)!.push(y);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-2">Shows by Year</h1>
      <p className="text-gray-400 mb-8">{years.length} years of live music</p>

      {Array.from(decades.entries()).map(([decade, decadeYears]) => (
        <div key={decade} className="mb-10">
          <h2 className="text-lg font-semibold text-purple-400 mb-3 border-b border-dead-border pb-2">
            {decade}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
            {decadeYears.map(({ year, count }) => (
              <Link
                key={year}
                href={`/years/${year}`}
                className="flex flex-col items-center p-3 rounded-lg border border-dead-border bg-dead-card hover:border-dead-gold hover:bg-dead-card-hover transition-all group"
              >
                <span className="text-base font-bold text-white group-hover:text-dead-gold transition-colors">
                  {year}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-gray-300 mt-0.5">
                  {count} shows
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
