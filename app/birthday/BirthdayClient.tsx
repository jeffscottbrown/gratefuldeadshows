"use client";

import { useState, useMemo } from "react";
import type { Show } from "@/lib/db";
import ShowList from "@/components/ShowList";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  allShows: Show[];
}

export default function BirthdayClient({ allShows }: Props) {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const monthNum = month ? parseInt(month, 10) : null;
  const dayNum = day ? parseInt(day, 10) : null;
  const valid = monthNum !== null && dayNum !== null;

  const shows = useMemo(() => {
    if (!valid || monthNum === null || dayNum === null) return [];
    const m = String(monthNum).padStart(2, "0");
    const d = String(dayNum).padStart(2, "0");
    const monthDay = `${m}-${d}`;
    return allShows.filter((show) => show.date.slice(5, 10) === monthDay);
  }, [allShows, monthNum, dayNum, valid]);

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-wrap items-end gap-4 mb-10 p-6 rounded-xl border border-dead-border bg-dead-card"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="month"
            className="text-xs text-gray-400 uppercase tracking-wider"
          >
            Month
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
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
          <label
            htmlFor="day"
            className="text-xs text-gray-400 uppercase tracking-wider"
          >
            Day
          </label>
          <select
            id="day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
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
      </form>

      {valid && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {MONTHS[(monthNum ?? 1) - 1]} {dayNum}
          </h2>
          {shows.length > 0 ? (
            <p className="text-gray-400 mb-6">
              {shows.length} show{shows.length !== 1 ? "s" : ""} played on this
              date across all years
            </p>
          ) : (
            <p className="text-gray-500 italic mt-4">
              No shows found on {MONTHS[(monthNum ?? 1) - 1]} {dayNum}. The
              Dead had a day off!
            </p>
          )}
          {shows.length > 0 && <ShowList shows={shows} />}
        </div>
      )}
    </>
  );
}
