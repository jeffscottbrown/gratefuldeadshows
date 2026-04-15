import type { Metadata } from 'next';
import Link from 'next/link';
import { getShowsByState } from '@/lib/db';
import { getReleasesMapForShows } from '@/lib/releases';
import ShowList from '@/components/ShowList';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const decoded = decodeURIComponent(state);
  return { title: `Shows in ${decoded}` };
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const decoded = decodeURIComponent(state);
  const shows = getShowsByState(decoded);
  const released = getReleasesMapForShows();

  if (shows.length === 0) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/states" className="hover:text-dead-gold transition-colors">
          States
        </Link>
        <span>/</span>
        <span className="text-gray-300">{decoded}</span>
      </div>
      <h1 className="text-3xl font-bold text-dead-gold mb-1">{decoded}</h1>
      <p className="text-gray-400 mb-8">
        {shows.length} show{shows.length !== 1 ? 's' : ''} in this state.
      </p>
      <ShowList shows={shows} releasesByDate={released} />
    </div>
  );
}
