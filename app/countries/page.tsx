import type { Metadata } from 'next';
import Link from 'next/link';
import { getCountries } from '@/lib/db';

export const metadata: Metadata = { title: 'Shows by Country' };

const countryNames: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  CA: 'Canada',
  AU: 'Australia',
  JP: 'Japan',
  IE: 'Ireland',
  CH: 'Switzerland',
  BE: 'Belgium',
  DK: 'Denmark',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  IT: 'Italy',
  AT: 'Austria',
  NZ: 'New Zealand',
  MX: 'Mexico',
  EG: 'Egypt',
};

function countryLabel(code: string): string {
  return countryNames[code] ?? code;
}

export default function CountriesPage() {
  const countries = getCountries();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-2">Shows by Country</h1>
      <p className="text-gray-400 mb-8">{countries.length} countries visited</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {countries.map(({ country, count }) => (
          <Link
            key={country}
            href={`/countries/${encodeURIComponent(country)}`}
            className="flex items-center justify-between px-5 py-4 rounded-xl border border-dead-border bg-dead-card hover:border-dead-gold hover:bg-dead-card-hover transition-all group"
          >
            <div>
              <div className="text-white font-medium group-hover:text-dead-gold transition-colors">
                {countryLabel(country)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{country}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-dead-gold">{count}</div>
              <div className="text-xs text-gray-500">shows</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
