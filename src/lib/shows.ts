/**
 * Show data access layer.
 *
 * All functions are async because they call getCollection() from Astro's
 * Content Layer. They must be called from .astro files only — React islands
 * receive pre-computed Show[] arrays as props.
 */

import { getCollection } from 'astro:content';
import { slugToDate, slugToYear, songSlug } from './format';

// ── Types (also used in React islands via props) ───────────────────────────

export type Band = 'gd' | 'dac';

export interface SetEntry {
  set: number;   // 1, 2, 3, 99 (encore)
  songs: string[];
}

export interface Show {
  /** URL path segment: "YYYY-MM-DD" or "YYYY-MM-DD-2" for duplicate dates. */
  slug: string;
  band: Band;
  /** Clean YYYY-MM-DD date (first 10 chars of slug). */
  date: string;
  year: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  setlist: SetEntry[];
  notes?: string;
}

// ── Internal loader ────────────────────────────────────────────────────────

function entryToShow(entry: { id: string; data: Record<string, unknown> }, band: Band): Show {
  const slug = entry.id.split('/').pop()!; // "1977/1977-05-08" → "1977-05-08"
  return {
    slug,
    band,
    date: slugToDate(slug),
    year: slugToYear(slug),
    venue: entry.data.venue as string,
    city: entry.data.city as string,
    state: (entry.data.state as string) ?? '',
    country: entry.data.country as string,
    setlist: (entry.data.setlist as SetEntry[]) ?? [],
    notes: entry.data.notes as string | undefined,
  };
}

// Cached per-build (Astro calls each page's getStaticPaths once per build)
let _cached: Show[] | null = null;

async function loadAll(): Promise<Show[]> {
  if (_cached) return _cached;

  const [gdEntries, dacEntries] = await Promise.all([
    getCollection('gd-shows'),
    // dac-shows collection may be empty if no DAC data has been added yet
    getCollection('dac-shows').catch(() => []),
  ]);

  const gd = gdEntries.map((e: any) => entryToShow(e, 'gd'));
  const dac = dacEntries.map((e: any) => entryToShow(e, 'dac'));

  _cached = [...gd, ...dac].sort((a, b) => a.date.localeCompare(b.date));
  return _cached;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getAllShows(): Promise<Show[]> {
  return loadAll();
}

export async function getShowBySlug(band: Band, slug: string): Promise<Show | undefined> {
  const all = await loadAll();
  return all.find((s) => s.band === band && s.slug === slug);
}

export async function getShowsByYear(year: string): Promise<Show[]> {
  const all = await loadAll();
  return all.filter((s) => s.year === year);
}

export async function getShowsByCity(city: string): Promise<Show[]> {
  const all = await loadAll();
  return all.filter((s) => s.city.toLowerCase() === city.toLowerCase());
}

export async function getShowsByState(state: string): Promise<Show[]> {
  const all = await loadAll();
  return all.filter((s) => s.state.toLowerCase() === state.toLowerCase());
}

export async function getShowsByCountry(country: string): Promise<Show[]> {
  const all = await loadAll();
  return all.filter((s) => s.country.toLowerCase() === country.toLowerCase());
}

export async function getShowsByVenue(venue: string): Promise<Show[]> {
  const all = await loadAll();
  return all.filter((s) => s.venue.toLowerCase() === venue.toLowerCase());
}

export async function getShowsBySong(title: string): Promise<Show[]> {
  const all = await loadAll();
  const lower = title.toLowerCase();
  return all.filter((s) =>
    s.setlist.some((set) => set.songs.some((song) => song.toLowerCase() === lower)),
  );
}

export async function getShowsByMonthDay(month: number, day: number): Promise<Show[]> {
  const all = await loadAll();
  const md = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return all.filter((s) => s.date.slice(5) === md);
}

// ── Index builders ─────────────────────────────────────────────────────────

export async function getYears(): Promise<{ year: string; gdCount: number; dacCount: number }[]> {
  const all = await loadAll();
  const map = new Map<string, { gdCount: number; dacCount: number }>();
  for (const s of all) {
    if (!map.has(s.year)) map.set(s.year, { gdCount: 0, dacCount: 0 });
    const entry = map.get(s.year)!;
    if (s.band === 'gd') entry.gdCount++;
    else entry.dacCount++;
  }
  return Array.from(map.entries())
    .map(([year, counts]) => ({ year, ...counts }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export async function getCities(): Promise<{ city: string; country: string; count: number }[]> {
  const all = await loadAll();
  const map = new Map<string, { country: string; count: number }>();
  for (const s of all) {
    const key = `${s.city}||${s.country}`;
    if (!map.has(key)) map.set(key, { country: s.country, count: 0 });
    map.get(key)!.count++;
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ city: key.split('||')[0], ...v }))
    .sort((a, b) => a.city.localeCompare(b.city, undefined, { sensitivity: 'base' }));
}

export async function getStates(): Promise<{ state: string; country: string; count: number }[]> {
  const all = await loadAll();
  const map = new Map<string, { country: string; count: number }>();
  for (const s of all) {
    if (!s.state) continue;
    const key = `${s.state}||${s.country}`;
    if (!map.has(key)) map.set(key, { country: s.country, count: 0 });
    map.get(key)!.count++;
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ state: key.split('||')[0], ...v }))
    .sort((a, b) => a.state.localeCompare(b.state, undefined, { sensitivity: 'base' }));
}

export async function getCountries(): Promise<{ country: string; count: number }[]> {
  const all = await loadAll();
  const map = new Map<string, number>();
  for (const s of all) map.set(s.country, (map.get(s.country) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getVenues(): Promise<{ venue: string; city: string; state: string; country: string; count: number }[]> {
  const all = await loadAll();
  const map = new Map<string, { city: string; state: string; country: string; count: number }>();
  for (const s of all) {
    if (!map.has(s.venue)) map.set(s.venue, { city: s.city, state: s.state, country: s.country, count: 0 });
    map.get(s.venue)!.count++;
  }
  return Array.from(map.entries())
    .map(([venue, v]) => ({ venue, ...v }))
    .sort((a, b) => a.venue.localeCompare(b.venue, undefined, { sensitivity: 'base' }));
}

export async function getSongs(): Promise<{ title: string; slug: string; count: number }[]> {
  const all = await loadAll();
  const map = new Map<string, number>();
  for (const show of all) {
    for (const set of show.setlist) {
      for (const song of set.songs) {
        map.set(song, (map.get(song) ?? 0) + 1);
      }
    }
  }

  // Build slugs, detect collisions, and resolve them
  const slugCount = new Map<string, number>();
  const entries = Array.from(map.entries()).map(([title]) => {
    const base = songSlug(title);
    slugCount.set(base, (slugCount.get(base) ?? 0) + 1);
    return { title, base };
  });

  const slugSuffix = new Map<string, number>();
  return entries
    .map(({ title, base }) => {
      let slug = base;
      if ((slugCount.get(base) ?? 1) > 1) {
        const n = (slugSuffix.get(base) ?? 0) + 1;
        slugSuffix.set(base, n);
        slug = n === 1 ? base : `${base}-${n}`;
      }
      return { title, slug, count: map.get(title)! };
    })
    .sort((a, b) => {
      const ka = a.title.replace(/^the\s+/i, '');
      const kb = b.title.replace(/^the\s+/i, '');
      return ka.localeCompare(kb, undefined, { sensitivity: 'base' });
    });
}

export async function getStats() {
  const all = await loadAll();
  const gdShows = all.filter((s) => s.band === 'gd');
  const dacShows = all.filter((s) => s.band === 'dac');
  const songs = new Set<string>();
  let performances = 0;
  const venues = new Set<string>();
  const cities = new Set<string>();
  const countries = new Set<string>();
  for (const s of all) {
    venues.add(s.venue);
    cities.add(s.city);
    countries.add(s.country);
    for (const set of s.setlist) {
      for (const song of set.songs) {
        songs.add(song);
        performances++;
      }
    }
  }
  return {
    gdShows: gdShows.length,
    dacShows: dacShows.length,
    totalShows: all.length,
    songs: songs.size,
    performances,
    venues: venues.size,
    cities: cities.size,
    countries: countries.size,
  };
}
