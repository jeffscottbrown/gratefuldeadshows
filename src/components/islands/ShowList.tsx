/**
 * React island: paginated, filterable show table.
 *
 * Receives pre-computed data as props from the .astro page — no server APIs
 * are called on the client. All navigation uses plain <a> tags (static site).
 */
import { useState, useMemo, useEffect } from 'react';
import { BADGES } from '@/lib/badges';
import { formatDate } from '@/lib/format';

export interface ShowRow {
  slug: string;
  band: string;
  date: string;
  year: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  /** Pre-computed collection slugs for this show (may be empty). */
  collections: string[];
}

interface Props {
  shows: ShowRow[];
  /** Whether to render the "only official releases" filter toggle. */
  showFilter?: boolean;
}

const PAGE_SIZE = 50;

export default function ShowList({ shows, showFilter = false }: Props) {
  const [onlyReleased, setOnlyReleased] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (onlyReleased ? shows.filter((s) => s.collections.length > 0) : shows),
    [shows, onlyReleased],
  );

  useEffect(() => setPage(1), [filtered]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (shows.length === 0) {
    return <p className="text-gray-500 italic text-center py-12">No shows found.</p>;
  }

  return (
    <div className="space-y-4">
      {showFilter && (
        <div className="flex items-center gap-3 mb-4">
          <label className="inline-flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={onlyReleased}
                onChange={(e) => setOnlyReleased(e.target.checked)}
              />
              <div className="w-10 h-5 bg-dead-card border border-dead-border rounded-full peer peer-checked:bg-dead-teal transition-all" />
              <div className="dot absolute left-1 top-1 bg-gray-500 w-3 h-3 rounded-full transition peer-checked:translate-x-5 peer-checked:bg-white" />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors select-none">
              Only shows with official releases
            </span>
          </label>
          <span className="text-[10px] text-dead-teal-light font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-dead-teal/30 bg-dead-teal/10">
            {filtered.length}
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-dead-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dead-border bg-dead-card">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Venue</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">City</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Year</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Country</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((show, i) => (
              <tr
                key={`${show.band}-${show.slug}`}
                className={`border-b border-dead-border/50 hover:bg-dead-card-hover transition-colors ${
                  i % 2 === 0 ? 'bg-dead-bg' : 'bg-dead-card/30'
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <a
                    href={`/shows/${show.band}/${show.slug}`}
                    className="text-dead-teal-light hover:text-teal-300 hover:underline transition-colors"
                  >
                    {formatDate(show.slug, 'short')}
                  </a>
                  {show.collections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {show.collections.map((col) => {
                        const b = BADGES[col];
                        if (!b) return null;
                        return (
                          <a
                            key={col}
                            href={`/collections/${col}`}
                            title={b.name}
                            className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none hover:opacity-80 transition-opacity ${b.cls}`}
                          >
                            {b.abbr}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/venues/${encodeURIComponent(show.venue)}`}
                    className="text-gray-200 hover:text-white hover:underline transition-colors"
                  >
                    {show.venue}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/cities/${encodeURIComponent(show.city)}`}
                    className="text-dead-gold hover:text-dead-gold-light hover:underline transition-colors"
                  >
                    {show.city}{show.state ? `, ${show.state}` : ''}
                  </a>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <a
                    href={`/years/${show.year}`}
                    className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                  >
                    {show.year}
                  </a>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <a
                    href={`/countries/${encodeURIComponent(show.country)}`}
                    className="text-gray-400 hover:text-gray-200 hover:underline transition-colors"
                  >
                    {show.country}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && onlyReleased && (
        <p className="text-gray-500 italic text-center py-8">No shows in this list have an official release.</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-dead-border bg-dead-card text-gray-300 hover:bg-dead-card-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
            <span className="ml-2 text-gray-600">({filtered.length} shows)</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-dead-border bg-dead-card text-gray-300 hover:bg-dead-card-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
