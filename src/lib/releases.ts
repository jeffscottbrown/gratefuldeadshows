/**
 * Release (official GD recordings) data access layer.
 *
 * Collection slug = first path segment of the entry id.
 * e.g. entry.id "daves-picks/vol-001" → slug "daves-picks"
 */

import { getCollection } from 'astro:content';
import { getBadge, BADGES } from './badges';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Release {
  /** Unique within the release list: "<collection>/<filename>" */
  id: string;
  collectionSlug: string;
  title: string;
  volume?: number;
  discUrl: string;
  imageUrl?: string;
  /** Exact show dates this release covers. */
  dates: string[];
  /** True if this release covers a date range rather than exact dates. */
  isRange: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CollectionSummary {
  slug: string;
  name: string;
  abbr: string;
  cls: string;
  releaseCount: number;
  showCount: number;
}

// ── Internal loader ────────────────────────────────────────────────────────

let _cached: Release[] | null = null;

async function loadAll(): Promise<Release[]> {
  if (_cached) return _cached;
  const entries = await getCollection('gd-releases');
  _cached = entries.map((entry: any) => {
    const data = entry.data as Record<string, unknown>;
    const id = entry.id as string;
    const collectionSlug = id.split('/')[0];
    const isRange = data.startDate !== undefined;
    return {
      id,
      collectionSlug,
      title: data.title as string,
      volume: data.volume as number | undefined,
      discUrl: data.discUrl as string,
      imageUrl: data.imageUrl as string | undefined,
      dates: (data.dates as string[] | undefined) ?? [],
      isRange,
      startDate: data.startDate as string | undefined,
      endDate: data.endDate as string | undefined,
    } satisfies Release;
  });
  return _cached!;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getAllReleases(): Promise<Release[]> {
  return loadAll();
}

export async function getReleasesByCollection(slug: string): Promise<Release[]> {
  const all = await loadAll();
  return all.filter((r) => r.collectionSlug === slug);
}

/**
 * Build a map of show date → collection slugs for badge rendering.
 * Range releases mark every date from startDate to endDate as covered
 * (we store only the boundary dates, so range shows are matched at query time).
 */
export async function buildReleasesDateIndex(): Promise<{
  exactByDate: Map<string, Set<string>>;
  ranges: { startDate: string; endDate: string; collectionSlug: string; releaseId: string }[];
}> {
  const all = await loadAll();
  const exactByDate = new Map<string, Set<string>>();
  const ranges: { startDate: string; endDate: string; collectionSlug: string; releaseId: string }[] = [];

  for (const r of all) {
    if (r.isRange && r.startDate && r.endDate) {
      ranges.push({ startDate: r.startDate, endDate: r.endDate, collectionSlug: r.collectionSlug, releaseId: r.id });
    } else {
      for (const date of r.dates) {
        if (!exactByDate.has(date)) exactByDate.set(date, new Set());
        exactByDate.get(date)!.add(r.collectionSlug);
      }
    }
  }

  return { exactByDate, ranges };
}

/**
 * Get the collection slugs for a given show date (handles both exact and range releases).
 */
export function getCollectionsForDate(
  date: string,
  index: { exactByDate: Map<string, Set<string>>; ranges: { startDate: string; endDate: string; collectionSlug: string }[] },
): string[] {
  const slugs = new Set<string>(index.exactByDate.get(date) ?? []);
  for (const r of index.ranges) {
    if (date >= r.startDate && date <= r.endDate) slugs.add(r.collectionSlug);
  }
  return Array.from(slugs);
}

export async function getAllCollections(): Promise<CollectionSummary[]> {
  const all = await loadAll();
  const map = new Map<string, { releases: Set<string>; dates: Set<string> }>();

  for (const r of all) {
    if (!map.has(r.collectionSlug)) map.set(r.collectionSlug, { releases: new Set(), dates: new Set() });
    const entry = map.get(r.collectionSlug)!;
    entry.releases.add(r.id);
    for (const d of r.dates) entry.dates.add(d);
    if (r.startDate) entry.dates.add(r.startDate);
  }

  return Array.from(map.entries())
    .map(([slug, { releases, dates }]) => {
      const badge = getBadge(slug);
      return {
        slug,
        name: badge.name,
        abbr: badge.abbr,
        cls: badge.cls,
        releaseCount: releases.size,
        showCount: dates.size,
      };
    })
    .sort((a, b) => b.showCount - a.showCount);
}
