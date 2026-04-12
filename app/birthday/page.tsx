import type { Metadata } from 'next';
import { getShowsByBirthday } from '@/lib/db';
import ShowList from '@/components/ShowList';

export const metadata: Metadata = { title: 'Birthday Shows' };

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  searchParams: Promise<{ month?: string; day?: string }>;
}

export default async function BirthdayPage({ searchParams }: Props) {
  const { month: monthStr, day: dayStr } = await searchParams;

  const month = monthStr ? parseInt(monthStr, 10) : null;
  const day = dayStr ? parseInt(dayStr, 10) : null;

  const valid =
    month !== null &&
    day !== null &&
    !isNaN(month) &&
    !isNaN(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31;

  const shows = valid ? getShowsByBirthday(month!, day!) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dead-gold mb-2">Birthday Shows</h1>
      <p className="text-gray-400 mb-8">
        Find every Grateful Dead concert played on your birthday.
      </p>

      {/* Form */}
      <form
        method="GET"
        action="/birthday"
        className="flex flex-wrap items-end gap-4 mb-10 p-6 rounded-xl border border-dead-border bg-dead-card"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="month" className="text-xs text-gray-400 uppercase tracking-wider">
            Month
          </label>
          <select
            id="month"
            name="month"
            defaultValue={month ?? ''}
            className="rounded-lg bg-dead-bg border border-dead-border text-white px-3 py-2 text-sm focus:outline-none focus:border-dead-gold"
          >
            <option value="" disabled>
              Select month
            </option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="day" className="text-xs text-gray-400 uppercase tracking-wider">
            Day
          </label>
          <select
            id="day"
            name="day"
            defaultValue={day ?? ''}
            className="rounded-lg bg-dead-bg border border-dead-border text-white px-3 py-2 text-sm focus:outline-none focus:border-dead-gold"
          >
            <option value="" disabled>
              Select day
            </option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-dead-gold text-dead-bg font-semibold text-sm hover:bg-dead-gold-light transition-colors"
        >
          Find Shows
        </button>
      </form>

      {/* Results */}
      {valid && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {MONTHS[(month ?? 1) - 1]} {day}
          </h2>
          {shows.length > 0 ? (
            <p className="text-gray-400 mb-6">
              {shows.length} show{shows.length !== 1 ? 's' : ''} played on this date across all years
            </p>
          ) : (
            <p className="text-gray-500 italic mt-4">
              No shows found on {MONTHS[(month ?? 1) - 1]} {day}. The Dead had a day off!
            </p>
          )}
          {shows.length > 0 && <ShowList shows={shows} />}
        </div>
      )}

      {!valid && monthStr && (
        <p className="text-red-400 text-sm">Please select a valid month and day.</p>
      )}
    </div>
  );
}
