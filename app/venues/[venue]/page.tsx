import type { Metadata } from 'next';
import { getShowsByVenue } from '@/lib/db';
import ShowList from '@/components/ShowList';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ venue: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venue } = await params;
  return { title: decodeURIComponent(venue) };
}

export default async function VenuePage({ params }: Props) {
  const { venue: encoded } = await params;
  const venue = decodeURIComponent(encoded);
  const shows = getShowsByVenue(venue);

  if (shows.length === 0) notFound();

  const firstShow = shows[0]!;
  const location = [firstShow.city, firstShow.state, firstShow.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-1">{venue}</h1>
      <p className="text-gray-400 mb-1">{location}</p>
      <p className="text-gray-500 mb-8 text-sm">
        {shows.length} show{shows.length !== 1 ? 's' : ''}
      </p>
      <ShowList shows={shows} />
    </div>
  );
}
