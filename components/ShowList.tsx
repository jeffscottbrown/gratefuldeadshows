import Link from 'next/link';
import type { Show } from '@/lib/db';

interface Props {
  shows: Show[];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ShowList({ shows }: Props) {
  if (shows.length === 0) {
    return (
      <p className="text-gray-500 italic text-center py-12">No shows found.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-dead-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dead-border bg-dead-card">
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Venue</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">City</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">
              Year
            </th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">
              Country
            </th>
          </tr>
        </thead>
        <tbody>
          {shows.map((show, i) => (
            <tr
              key={show.id}
              className={`border-b border-dead-border/50 hover:bg-dead-card-hover transition-colors ${
                i % 2 === 0 ? 'bg-dead-bg' : 'bg-dead-card/30'
              }`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  href={`/shows/${show.id}`}
                  className="text-dead-teal-light hover:text-teal-300 hover:underline transition-colors"
                >
                  {formatDate(show.date)}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/venues/${encodeURIComponent(show.venue)}`}
                  className="text-gray-200 hover:text-white hover:underline transition-colors"
                >
                  {show.venue}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/cities/${encodeURIComponent(show.city)}`}
                  className="text-dead-gold hover:text-dead-gold-light hover:underline transition-colors"
                >
                  {show.city}
                  {show.state ? `, ${show.state}` : ''}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <Link
                  href={`/years/${show.year}`}
                  className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  {show.year}
                </Link>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Link
                  href={`/countries/${encodeURIComponent(show.country)}`}
                  className="text-gray-400 hover:text-gray-200 hover:underline transition-colors"
                >
                  {show.country}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
