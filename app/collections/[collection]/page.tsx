import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  getReleasesByCollection,
  getCollectionFromSlug,
  getAllCollections,
  getCollectionSlug,
} from "@/lib/releases";
import { getShowByDate } from "@/lib/db";
import { notFound } from "next/navigation";
import CollectionContent from "./CollectionContent";

interface Props {
  params: Promise<{ collection: string }>;
}

export function generateStaticParams() {
  return getAllCollections().map((c) => ({
    collection: getCollectionSlug(c.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params;
  const collectionName = getCollectionFromSlug(slug);
  if (!collectionName) return { title: "Collection Not Found" };
  return { title: `${collectionName} Releases` };
}

export default async function CollectionPage({ params }: Props) {
  const { collection: slug } = await params;
  const collectionName = getCollectionFromSlug(slug);
  if (!collectionName) notFound();

  const releases = getReleasesByCollection(collectionName);

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

      <h1 className="text-3xl font-bold text-dead-gold mb-1">
        {collectionName}
      </h1>
      <p className="text-gray-400 mb-8">
        {allDates.size} show{allDates.size !== 1 ? "s" : ""} in this
        collection.
      </p>

      <Suspense>
        <CollectionContent
          releases={releasesWithShows}
          hasVolumes={hasVolumes}
          collectionName={collectionName}
        />
      </Suspense>
    </div>
  );
}
