import type { Metadata } from 'next';
import { getSongs } from '@/lib/db';
import SongSearch from '@/components/SongSearch';

export const metadata: Metadata = { title: 'Songs' };

export default function SongsPage() {
  const songs = getSongs();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-2">Songs</h1>
      <p className="text-gray-400 mb-6">{songs.length} distinct songs in the repertoire</p>
      <SongSearch songs={songs} />
    </div>
  );
}
