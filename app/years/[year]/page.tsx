import type { Metadata } from 'next';
import Link from 'next/link';
import { getShowsByYear } from '@/lib/db';
import ShowList from '@/components/ShowList';

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return { title: `${year} Shows` };
}

export default async function YearPage({ params }: Props) {
  const { year } = await params;
  const shows = getShowsByYear(year);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/years" className="hover:text-dead-gold transition-colors">
          Years
        </Link>
        <span>/</span>
        <span className="text-gray-300">{year}</span>
      </div>
      <h1 className="text-3xl font-bold text-dead-gold mb-1">{year}</h1>
      <p className="text-gray-400 mb-8">
        {shows.length} show{shows.length !== 1 ? 's' : ''}
      </p>
      <ShowList shows={shows} />
    </div>
  );
}
