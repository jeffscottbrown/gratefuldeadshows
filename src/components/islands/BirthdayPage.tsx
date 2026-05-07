/**
 * React island: find shows played on a given month/day.
 * Reads initial month/day from URL params set by the "Today" header link.
 */
import { useState, useMemo, useEffect } from 'react';
import ShowList, { type ShowRow } from './ShowList';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BirthdayPage({ shows }: { shows: ShowRow[] }) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  // Read month/day from URL on mount (set by the "Today" link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('month');
    const d = params.get('day');
    if (m) setMonth(m);
    if (d) setDay(d);
  }, []);

  const monthNum = month ? parseInt(month, 10) : null;
  const dayNum = day ? parseInt(day, 10) : null;
  const valid = monthNum !== null && dayNum !== null;

  const matched = useMemo(() => {
    if (!valid || monthNum === null || dayNum === null) return [];
    const md = `${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return shows.filter((s) => s.date.slice(5) === md);
  }, [shows, monthNum, dayNum, valid]);

  const selectCls =
    'rounded-lg bg-dead-bg border border-dead-border text-white px-3 py-2 text-sm focus:outline-none focus:border-dead-gold';

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-wrap items-end gap-4 mb-10 p-6 rounded-xl border border-dead-border bg-dead-card"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="bd-month" className="text-xs text-gray-400 uppercase tracking-wider">Month</label>
          <select id="bd-month" value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
            <option value="" disabled>Select month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="bd-day" className="text-xs text-gray-400 uppercase tracking-wider">Day</label>
          <select id="bd-day" value={day} onChange={(e) => setDay(e.target.value)} className={selectCls}>
            <option value="" disabled>Select day</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </form>

      {valid && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {MONTHS[(monthNum ?? 1) - 1]} {dayNum}
          </h2>
          {matched.length > 0 ? (
            <>
              <p className="text-gray-400 mb-6">
                {matched.length} show{matched.length !== 1 ? 's' : ''} played on this date across all years
              </p>
              <ShowList shows={matched} showFilter />
            </>
          ) : (
            <p className="text-gray-500 italic mt-4">
              No shows found on {MONTHS[(monthNum ?? 1) - 1]} {dayNum}. The Dead had a day off!
            </p>
          )}
        </div>
      )}
    </>
  );
}
