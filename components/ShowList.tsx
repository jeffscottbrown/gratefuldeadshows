"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { Show } from "@/lib/db";
import type { Collection } from "@/lib/releases";
import { getCollectionSlug } from "@/lib/releases";
import { BADGE } from "@/lib/collectionBadges";

const PAGE_SIZE = 50;

interface Props {
  shows: Show[];
  releasesByDate?: Map<string, Collection[]>;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ShowList({ shows, releasesByDate }: Props) {
  const [onlyReleased, setOnlyReleased] = useState(false);
  const [page, setPage] = useState(1);

  const filteredShows = useMemo(() => {
    if (!onlyReleased || !releasesByDate) return shows;
    return shows.filter((s) => releasesByDate.has(s.date.slice(0, 10)));
  }, [shows, releasesByDate, onlyReleased]);

  // Reset to page 1 whenever the filtered set changes
  useEffect(() => setPage(1), [filteredShows]);

  const totalPages = Math.ceil(filteredShows.length / PAGE_SIZE);
  const pagedShows = filteredShows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (shows.length === 0) {
    return (
      <p className="text-gray-500 italic text-center py-12">No shows found.</p>
    );
  }

  return (
    <div className="space-y-4">
      {releasesByDate && (
        <div className="flex items-center gap-2 mb-4">
          <label className="inline-flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={onlyReleased}
                onChange={(e) => setOnlyReleased(e.target.checked)}
              />
              <div className="w-10 h-5 bg-dead-card border border-dead-border rounded-full peer peer-checked:bg-dead-teal transition-all"></div>
              <div className="dot absolute left-1 top-1 bg-gray-500 w-3 h-3 rounded-full transition peer-checked:translate-x-5 peer-checked:bg-white"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors select-none">
              Only shows with official releases
            </span>
          </label>
          <span className="text-[10px] text-dead-teal-light font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-dead-teal/30 bg-dead-teal/10">
            {filteredShows.length}
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
            {pagedShows.map((show, i) => {
              const date = show.date.slice(0, 10);
              const collections = releasesByDate?.get(date);
              return (
                <tr
                  key={show.id}
                  className={`border-b border-dead-border/50 hover:bg-dead-card-hover transition-colors ${
                    i % 2 === 0 ? "bg-dead-bg" : "bg-dead-card/30"
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/shows/${show.id}`}
                      className="text-dead-teal-light hover:text-teal-300 hover:underline transition-colors"
                    >
                      {formatDate(show.date)}
                    </Link>
                    {collections && collections.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {collections.map((col) => {
                          const badge = BADGE[col];
                          return (
                            <Link
                              key={col}
                              href={`/collections/${getCollectionSlug(col)}`}
                              title={col}
                              className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none hover:opacity-80 transition-opacity ${badge.cls}`}
                            >
                              {badge.abbr}
                            </Link>
                          );
                        })}
                      </div>
                    )}
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
                      {show.state ? `, ${show.state}` : ""}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredShows.length === 0 && onlyReleased && (
        <p className="text-gray-500 italic text-center py-8">
          No shows in this list have an official release.
        </p>
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
            <span className="ml-2 text-gray-600">({filteredShows.length} shows)</span>
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
