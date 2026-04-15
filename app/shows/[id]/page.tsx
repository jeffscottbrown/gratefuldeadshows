import type { Metadata } from "next";
import Link from "next/link";
import { getShow } from "@/lib/db";
import { getReleasesForShow, getCollectionSlug } from "@/lib/releases";
import { BADGE } from "@/lib/collectionBadges";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const show = getShow(Number(id));
  if (!show) return { title: "Show Not Found" };
  return { title: `${show.date} — ${show.venue}` };
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SET_LABELS: Record<number, string> = {
  1: "Set 1",
  2: "Set 2",
  3: "Set 3",
  99: "Encore",
};

function setLabel(n: number): string {
  return SET_LABELS[n] ?? `Set ${n}`;
}

export default async function ShowPage({ params }: Props) {
  const { id } = await params;
  const show = getShow(Number(id));
  if (!show) notFound();

  const releases = getReleasesForShow(show.date.slice(0, 10));
  const dateStr = show.date.slice(0, 10);
  const relistenUrl = `https://relisten.net/grateful-dead/${dateStr.replace(/-/g, "/")}`;
  const archiveUrl = `https://archive.org/search.php?query=collection%3AGratefulDead%20AND%20date%3A${dateStr}`;

  // Unique collections for the header badges
  const uniqueCollections = Array.from(
    new Set(releases.map((r) => r.collection).filter((c): c is any => !!c)),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href={`/years/${show.year}`}
          className="hover:text-dead-gold transition-colors"
        >
          {show.year}
        </Link>
        <span>/</span>
        <Link
          href={`/cities/${encodeURIComponent(show.city)}`}
          className="hover:text-dead-gold transition-colors"
        >
          {show.city}
        </Link>
        <span>/</span>
        <span className="text-gray-300 truncate">{show.venue}</span>
      </div>

      {/* Show header */}
      <div className="rounded-xl border border-dead-border bg-dead-card p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {show.venue}
          </h1>
          <div className="flex flex-wrap gap-2">
            {uniqueCollections.map((col: any) => {
              const badge = BADGE[col as keyof typeof BADGE];
              return (
                <Link
                  key={col}
                  href={`/collections/${getCollectionSlug(col)}`}
                  title={col}
                  className={`inline-block rounded-full px-2 py-1 text-xs font-bold leading-none hover:opacity-80 transition-opacity ${badge?.cls ?? "bg-gray-700 text-gray-100"}`}
                >
                  {badge?.abbr ?? col}
                </Link>
              );
            })}
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Date
            </dt>
            <dd className="text-gray-200">{formatDate(show.date)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Year
            </dt>
            <dd>
              <Link
                href={`/years/${show.year}`}
                className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
              >
                {show.year}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              City
            </dt>
            <dd>
              <Link
                href={`/cities/${encodeURIComponent(show.city)}`}
                className="text-dead-gold hover:text-dead-gold-light hover:underline transition-colors"
              >
                {show.city}
                {show.state ? `, ${show.state}` : ""}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Country
            </dt>
            <dd>
              <Link
                href={`/countries/${encodeURIComponent(show.country)}`}
                className="text-gray-300 hover:text-white hover:underline transition-colors"
              >
                {show.country}
              </Link>
            </dd>
          </div>
        </dl>
      </div>

      {/* Listen + Releases tiles */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Listen tile */}
        <div className="rounded-xl border border-dead-border bg-dead-card p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Listen
          </h2>
          <div className="flex flex-col gap-2">
            <Link
              href={relistenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-dead-teal text-white text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Relisten ↗
            </Link>
            <Link
              href={archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-dead-border border border-dead-border text-white text-sm font-medium hover:bg-dead-card-hover transition-colors whitespace-nowrap"
            >
              Archive.org ↗
            </Link>
          </div>
        </div>

        {/* Official releases tile */}
        {releases.length > 0 && (
          <div className="rounded-xl border border-dead-border bg-dead-card p-5 flex-1">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Official Releases
            </h2>
            <div className="flex flex-col gap-3">
              {releases.map((release) => {
                const badge = release.collection
                  ? BADGE[release.collection]
                  : null;
                return (
                  <div key={release.discUrl} className="flex gap-3 items-start">
                    <div className="flex flex-col gap-1 min-w-0">
                      <Link
                        href={release.discUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-dead-gold hover:text-white hover:underline transition-colors leading-tight"
                      >
                        {release.title} ↗
                      </Link>
                      {badge && release.collection && (
                        <Link
                          href={`/collections/${getCollectionSlug(release.collection)}`}
                          title={release.collection}
                          className={`self-start inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none hover:opacity-80 transition-opacity ${badge.cls}`}
                        >
                          {badge.abbr}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Setlist */}
      {show.sets.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-dead-teal-light mb-4">
            Setlist
          </h2>
          <div className="space-y-6">
            {show.sets.map((set) => (
              <div key={set.set_number}>
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
                  {setLabel(set.set_number)}
                </h3>
                <ol className="space-y-1">
                  {set.songs.map((song, i) => (
                    <li
                      key={song.song_id}
                      className="flex items-center gap-3 group"
                    >
                      <span className="text-xs text-gray-600 w-6 text-right shrink-0">
                        {i + 1}.
                      </span>
                      <Link
                        href={`/songs/${song.song_id}`}
                        className="text-sm text-gray-200 hover:text-dead-gold hover:underline transition-colors"
                      >
                        {song.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">
          No setlist data available for this show.
        </p>
      )}
    </div>
  );
}
