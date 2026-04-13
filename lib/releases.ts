import releasesRaw from '@/data/releases.json';

export interface Release {
  title: string;
  discUrl: string;
}

type RawEntry =
  | { type: 'exact'; dates: string[]; title: string; discUrl: string }
  | { type: 'range'; startDate: string; endDate: string; title: string; discUrl: string };

const data = releasesRaw as RawEntry[];

// Build lookup structures once at module load
const exactIndex = new Map<string, Release[]>();
const ranges: Array<{ startDate: string; endDate: string } & Release> = [];

for (const entry of data) {
  const release: Release = { title: entry.title, discUrl: entry.discUrl };
  if (entry.type === 'exact') {
    for (const date of entry.dates) {
      const existing = exactIndex.get(date);
      if (existing) {
        existing.push(release);
      } else {
        exactIndex.set(date, [release]);
      }
    }
  } else {
    ranges.push({ ...release, startDate: entry.startDate, endDate: entry.endDate });
  }
}

export function getReleasesForShow(date: string): Release[] {
  const results: Release[] = [...(exactIndex.get(date) ?? [])];
  for (const range of ranges) {
    if (date >= range.startDate && date <= range.endDate) {
      results.push({ title: range.title, discUrl: range.discUrl });
    }
  }
  return results;
}
