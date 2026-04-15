import releasesRaw from "@/data/releases.json";

export type Collection =
  | "Dick's Picks"
  | "Dave's Picks"
  | "Road Trips"
  | "Download Series"
  | "30 Trips Around The Sun"
  | "Europe '72"
  | "May 1977"
  | "Pacific Northwest"
  | "July 1978"
  | "Spring 1990"
  | "Friend Of The Devils"
  | "Listen To The River"
  | "In And Out Of The Garden"
  | "Giants Stadium"
  | "Believe It If You Need It"
  | "Saint Of Circumstance"
  | "Ready Or Not"
  | "Lyceum 1972"
  | "Winterland"
  | "Here Comes Sunshine"
  | "From The Vault"
  | "View From The Vault"
  | "Rocking The Cradle"
  | "Hunter's Trix";

export interface Release {
  title: string;
  discUrl: string;
  imageUrl?: string;
  collection?: Collection;
  dates?: string[];
  volume?: number;
}

type RawEntry =
  | {
      type: "exact";
      dates: string[];
      title: string;
      discUrl: string;
      imageUrl?: string;
      volume?: number;
    }
  | {
      type: "range";
      startDate: string;
      endDate: string;
      title: string;
      discUrl: string;
      imageUrl?: string;
      volume?: number;
    };

const data = releasesRaw as RawEntry[];

// Build lookup structures once at module load
const exactIndex = new Map<string, Release[]>();
const ranges: Array<{ startDate: string; endDate: string } & Release> = [];
const collectionIndex = new Map<Collection, Release[]>();

function detectCollection(title: string): Collection | undefined {
  const t = title.toLowerCase();

  // Specific Boxed Sets / Collections (ordered by specificity)
  if (t.includes("dick's picks")) return "Dick's Picks";
  if (t.includes("dave's picks")) return "Dave's Picks";
  if (t.includes("road trips")) return "Road Trips";
  if (t.includes("download series")) return "Download Series";
  if (t.includes("30 trips around the sun")) return "30 Trips Around The Sun";
  if (t.includes("europe '72")) return "Europe '72";
  if (t.includes("may 1977")) return "May 1977";
  if (t.includes("get shown the light")) return "May 1977";
  if (t.includes("pacific northwest")) return "Pacific Northwest";
  if (t.includes("believe it if you need it")) return "Pacific Northwest";
  if (t.includes("july 1978")) return "July 1978";
  if (t.includes("spring 1990")) return "Spring 1990";
  if (t.includes("friend of the devils")) return "Friend Of The Devils";
  if (t.includes("listen to the river")) return "Listen To The River";
  if (t.includes("in and out of the garden")) return "In And Out Of The Garden";
  if (t.includes("giants stadium")) return "Giants Stadium";
  if (t.includes("saint of circumstance")) return "Saint Of Circumstance";
  if (t.includes("ready or not")) return "Ready Or Not";
  if (t.includes("lyceum '72")) return "Lyceum 1972";
  if (t.includes("winterland")) return "Winterland";
  if (t.includes("here comes sunshine")) return "Here Comes Sunshine";
  if (t.includes("view from the vault")) return "View From The Vault";
  if (t.includes("from the vault")) return "From The Vault";
  if (t.includes("rocking the cradle")) return "Rocking The Cradle";
  if (t.includes("hunter's trix")) return "Hunter's Trix";

  return undefined;
}

for (const entry of data) {
  const collection = detectCollection(entry.title);
  const entryDates =
    entry.type === "exact" ? entry.dates : [entry.startDate, entry.endDate];
  const release: Release = {
    title: entry.title,
    discUrl: entry.discUrl,
    imageUrl: entry.imageUrl,
    collection,
    dates: entryDates,
    volume: entry.volume,
  };

  // Add to collection index
  if (collection) {
    if (!collectionIndex.has(collection)) {
      collectionIndex.set(collection, []);
    }

    // Merge dates for same title/collection
    const existingRelease = collectionIndex
      .get(collection)!
      .find((r) => r.title === release.title);
    if (existingRelease) {
      if (release.dates) {
        existingRelease.dates = Array.from(
          new Set([...(existingRelease.dates ?? []), ...release.dates]),
        ).sort();
      }
    } else {
      collectionIndex
        .get(collection)!
        .push({ ...release, dates: [...(release.dates ?? [])] });
    }
  }

  if (entry.type === "exact") {
    for (const date of entry.dates) {
      const existing = exactIndex.get(date);
      if (existing) {
        existing.push(release);
      } else {
        exactIndex.set(date, [release]);
      }
    }
  } else {
    ranges.push({
      ...release,
      startDate: entry.startDate,
      endDate: entry.endDate,
    });
  }
}

export function getReleasesForShow(date: string): Release[] {
  const results: Release[] = [...(exactIndex.get(date) ?? [])];
  for (const range of ranges) {
    if (date >= range.startDate && date <= range.endDate) {
      results.push({
        title: range.title,
        discUrl: range.discUrl,
        imageUrl: range.imageUrl,
        collection: range.collection,
        dates: range.dates,
        volume: range.volume,
      });
    }
  }
  return results;
}

export function getReleasesByCollection(collection: Collection): Release[] {
  return collectionIndex.get(collection) ?? [];
}

export function getShowsWithReleases(): Set<string> {
  const dates = new Set<string>();
  for (const date of exactIndex.keys()) {
    dates.add(date);
  }
  return dates;
}

export function getReleasesMapForShows(): Map<string, Collection[]> {
  const map = new Map<string, Collection[]>();
  for (const [date, releases] of exactIndex.entries()) {
    const collections = Array.from(
      new Set(releases.map((r) => r.collection).filter((c): c is Collection => c !== undefined))
    );
    if (collections.length > 0) map.set(date, collections);
  }
  return map;
}

export function getAllCollections(): {
  name: Collection;
  count: number;
  showCount: number;
}[] {
  return Array.from(collectionIndex.entries())
    .map(([name, releases]) => {
      const allDates = new Set<string>();
      for (const r of releases) {
        for (const d of r.dates ?? []) {
          allDates.add(d);
        }
      }
      return { name, count: releases.length, showCount: allDates.size };
    })
    .sort((a, b) => b.showCount - a.showCount);
}

export function getCollectionSlug(collection: Collection): string {
  return collection
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

export function getCollectionFromSlug(slug: string): Collection | undefined {
  const all = Array.from(collectionIndex.keys());
  return all.find((s) => getCollectionSlug(s) === slug);
}
