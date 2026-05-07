/**
 * React island: A-Z song browser with live search.
 */
import { useState } from 'react';

interface SongEntry {
  title: string;
  slug: string;
  count: number;
}

export default function SongSearch({ songs }: { songs: SongEntry[] }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q ? songs.filter((s) => s.title.toLowerCase().includes(q)) : null;

  // A-Z grouping (ignore leading "The ")
  const byLetter = new Map<string, SongEntry[]>();
  for (const s of songs) {
    const sortKey = s.title.replace(/^the\s+/i, '');
    const letter = sortKey[0]?.toUpperCase() ?? '#';
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push(s);
  }
  const letters = Array.from(byLetter.keys()).sort();

  return (
    <>
      <div className="relative mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs…"
          className="w-full sm:w-80 rounded-lg bg-dead-card border border-dead-border text-white placeholder-gray-500 px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-dead-gold transition-colors"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">🔍</span>
      </div>

      {filtered !== null ? (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          {filtered.length === 0
            ? <p className="text-gray-500 italic">No songs match your search.</p>
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filtered.map((s) => <SongLink key={s.slug} {...s} />)}
              </div>
            )
          }
        </div>
      ) : (
        <>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {byLetter.get(letter)!.map((s) => <SongLink key={s.slug} {...s} />)}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

function SongLink({ title, slug, count }: SongEntry) {
  return (
    <a
      href={`/songs/${slug}`}
      className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-dead-border bg-dead-card hover:border-dead-gold hover:bg-dead-card-hover transition-all group"
    >
      <span className="text-sm text-white group-hover:text-dead-gold transition-colors truncate pr-2">
        {title}
      </span>
      <span className="text-xs text-gray-500 shrink-0 group-hover:text-gray-300">{count}×</span>
    </a>
  );
}
