import type { Metadata } from 'next';
import Link from 'next/link';
import { getSongById, getShowsBySong, getSongs } from '@/lib/db';
import ShowList from '@/components/ShowList';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return getSongs().map(({ id }) => ({ id: String(id) }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const song = getSongById(Number(id));
  if (!song) return { title: 'Song Not Found' };
  return { title: song.title };
}

export default async function SongPage({ params }: Props) {
  const { id } = await params;
  const song = getSongById(Number(id));
  if (!song) notFound();

  const shows = getShowsBySong(song.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/songs" className="hover:text-dead-gold transition-colors">
          Songs
        </Link>
        <span>/</span>
        <span className="text-gray-300">{song.title}</span>
      </div>
      <h1 className="text-3xl font-bold text-dead-gold mb-1">{song.title}</h1>
      <p className="text-gray-400 mb-8">
        Played at {shows.length} show{shows.length !== 1 ? 's' : ''}
      </p>
      <ShowList shows={shows} />
    </div>
  );
}
