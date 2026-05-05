"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CoverImage from "@/components/CoverImage";

interface DateInfo {
  date: string;
  show: { id: number } | null;
}

interface ReleaseWithShows {
  title: string;
  discUrl: string;
  imageUrl?: string;
  dates?: string[];
  volume?: number;
  dateInfo: DateInfo[];
}

interface Props {
  releases: ReleaseWithShows[];
  hasVolumes: boolean;
  collectionName: string;
}

export default function CollectionContent({
  releases,
  hasVolumes,
  collectionName,
}: Props) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort");

  const sorted = [...releases].sort((a, b) => {
    if (sort === "volume") return (a.volume ?? 0) - (b.volume ?? 0);
    const dateA = a.dates?.[0] ?? "";
    const dateB = b.dates?.[0] ?? "";
    return dateA.localeCompare(dateB);
  });

  return (
    <>
      {hasVolumes && (
        <div className="flex items-center gap-3 bg-dead-card border border-dead-border rounded-lg p-1 self-start mb-6">
          <Link
            href="?sort=date"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              sort !== "volume"
                ? "bg-dead-teal text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            By Date
          </Link>
          <Link
            href="?sort=volume"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              sort === "volume"
                ? "bg-dead-teal text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            By Volume
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sorted.map((release) => (
          <div
            key={release.title}
            className="p-3 rounded-xl border border-dead-border bg-dead-card flex flex-col hover:border-dead-gold/50 transition-colors group"
          >
            {release.imageUrl && (
              <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-dead-bg border border-dead-border">
                <CoverImage
                  src={release.imageUrl}
                  alt={release.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <h3 className="text-xs font-semibold text-white mb-1 leading-tight group-hover:text-dead-gold transition-colors">
              {release.title}
            </h3>
            {release.dateInfo.length > 0 && (
              <div className="text-[10px] text-gray-500 mb-2 flex flex-wrap gap-x-1.5 gap-y-0.5">
                {release.dateInfo.map(({ date, show }) =>
                  show ? (
                    <Link
                      key={date}
                      href={`/shows/${show.id}`}
                      className="text-dead-gold hover:text-white hover:underline transition-colors"
                    >
                      {date}
                    </Link>
                  ) : (
                    <span key={date} className="text-gray-600">
                      {date}
                    </span>
                  ),
                )}
              </div>
            )}
            <div className="mt-auto flex flex-col gap-1">
              {release.dateInfo[0]?.date && (
                <Link
                  href={`https://relisten.net/grateful-dead/${release.dateInfo[0].date.replace(/-/g, "/")}`}
                  className="inline-flex items-center text-[10px] text-dead-teal-light hover:text-white transition-colors"
                >
                  Relisten ↗
                </Link>
              )}
              <Link
                href={release.discUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[10px] text-dead-teal-light hover:text-white transition-colors"
              >
                {collectionName === "Hunter's Trix"
                  ? "Archive.org ↗"
                  : "Details on DeadDisc ↗"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
