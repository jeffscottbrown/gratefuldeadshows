import type { Metadata } from "next";
import Link from "next/link";
import { getReleasesByCollection, getCollectionFromSlug } from "@/lib/releases";
import { getShowByDate } from "@/lib/db";
import { notFound } from "next/navigation";
import CoverImage from "@/components/CoverImage";

interface Props {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params;
  const collectionName = getCollectionFromSlug(slug);
  if (!collectionName) return { title: "Collection Not Found" };
  return { title: `${collectionName} Releases` };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { collection: slug } = await params;
  const { sort } = await searchParams;
  const collectionName = getCollectionFromSlug(slug);
  if (!collectionName) notFound();

  let releases = getReleasesByCollection(collectionName);

  // Sorting logic
  if (sort === "volume") {
    releases = [...releases].sort((a, b) => (a.volume ?? 0) - (b.volume ?? 0));
  } else {
    // Default: Sort by first show date
    releases = [...releases].sort((a, b) => {
      const dateA = a.dates?.[0] ?? "";
      const dateB = b.dates?.[0] ?? "";
      return dateA.localeCompare(dateB);
    });
  }

  // Pre-resolve shows for each release and count unique dates
  const allDates = new Set<string>();
  const releasesWithShows = releases.map((rel) => {
    (rel.dates ?? []).forEach((d) => allDates.add(d));
    return {
      ...rel,
      dateInfo: (rel.dates ?? []).map((d) => ({
        date: d,
        show: getShowByDate(d),
      })),
    };
  });

  const hasVolumes = releases.some((r) => r.volume !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href="/collections"
          className="hover:text-dead-gold transition-colors"
        >
          Collections
        </Link>
        <span>/</span>
        <span className="text-gray-300">{collectionName}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dead-gold mb-1">
            {collectionName}
          </h1>
          <p className="text-gray-400">
            {allDates.size} show{allDates.size !== 1 ? "s" : ""} in this
            collection.
          </p>
        </div>

        {hasVolumes && (
          <div className="flex items-center gap-3 bg-dead-card border border-dead-border rounded-lg p-1">
            <Link
              href={`?sort=date`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sort !== "volume"
                  ? "bg-dead-teal text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              By Date
            </Link>
            <Link
              href={`?sort=volume`}
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {releasesWithShows.map((release) => (
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
    </div>
  );
}
