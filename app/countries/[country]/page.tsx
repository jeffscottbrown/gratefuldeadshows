import type { Metadata } from 'next';
import Link from 'next/link';
import { getShowsByCountry } from '@/lib/db';
import ShowList from '@/components/ShowList';

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  return { title: `Shows in ${decodeURIComponent(country)}` };
}

export default async function CountryPage({ params }: Props) {
  const { country: encoded } = await params;
  const country = decodeURIComponent(encoded);
  const shows = getShowsByCountry(country);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/countries" className="hover:text-dead-gold transition-colors">
          Countries
        </Link>
        <span>/</span>
        <span className="text-gray-300">{country}</span>
      </div>
      <h1 className="text-3xl font-bold text-dead-gold mb-1">{country}</h1>
      <p className="text-gray-400 mb-8">
        {shows.length} show{shows.length !== 1 ? 's' : ''}
      </p>
      <ShowList shows={shows} />
    </div>
  );
}
