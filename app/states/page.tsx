import type { Metadata } from 'next';
import Link from 'next/link';
import { getStates } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Shows by State',
  description: 'Browse Grateful Dead shows by US state.',
};

export default function StatesPage() {
  const states = getStates();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-8">Browse by State</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {states.map(({ state, country, count }) => (
          <Link
            key={`${state}-${country}`}
            href={`/states/${encodeURIComponent(state)}`}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-dead-border bg-dead-card hover:border-dead-gold hover:bg-dead-card-hover transition-all group"
          >
            <div className="truncate pr-2">
              <span className="text-sm font-medium text-white group-hover:text-dead-gold transition-colors">
                {state}
              </span>
              <span className="text-[10px] text-gray-500 ml-2 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {country}
              </span>
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
