#!/usr/bin/env node
/**
 * Export SQLite show data and releases.json → JSON files for the Astro project.
 *
 * Usage:
 *   node scripts/export-to-astro.mjs
 *
 * Outputs:
 *   data/gd/shows/YYYY/YYYY-MM-DD.json   (one per show; duplicate dates get -2 suffix)
 *   data/gd/releases/<collection>/<vol>.json
 */

import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function writeJson(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function titleSlug(title) {
  return title
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// Shows: SQLite → data/gd/shows/YYYY/YYYY-MM-DD.json
// ---------------------------------------------------------------------------

function exportShows() {
  const db = new Database(join(root, 'db', 'gratefuldata.db'), { readonly: true });

  // Load all shows sorted by date then id (stable order for duplicates)
  const shows = db.prepare(`
    SELECT id, date(date) AS d, venue, city, state, country
    FROM shows
    ORDER BY d, id
  `).all();

  // Load all setlist rows in one query
  const setRows = db.prepare(`
    SELECT st.show_id, st.set_number, sp.order_in_set, sg.title
    FROM sets st
    JOIN song_performances sp ON sp.set_id = st.id
    JOIN songs sg             ON sg.id     = sp.song_id
    ORDER BY st.show_id, st.set_number, sp.order_in_set
  `).all();

  // Index setlist by show_id
  const setsByShow = new Map();
  for (const row of setRows) {
    if (!setsByShow.has(row.show_id)) setsByShow.set(row.show_id, new Map());
    const setsMap = setsByShow.get(row.show_id);
    if (!setsMap.has(row.set_number)) setsMap.set(row.set_number, []);
    setsMap.get(row.set_number).push(row.title);
  }

  // Track which dates have already been written (for -2, -3 suffixes)
  const dateCounts = new Map();
  let written = 0;

  for (const show of shows) {
    const date = show.d; // "YYYY-MM-DD"
    const year = date.slice(0, 4);
    const count = (dateCounts.get(date) ?? 0) + 1;
    dateCounts.set(date, count);

    const slug = count === 1 ? date : `${date}-${count}`;
    const filePath = join(root, 'data', 'gd', 'shows', year, `${slug}.json`);

    // Build setlist
    const setsMap = setsByShow.get(show.id) ?? new Map();
    const setlist = Array.from(setsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([set, songs]) => ({ set, songs }));

    const payload = {
      venue: show.venue,
      city: show.city,
      state: show.state ?? '',
      country: show.country,
      ...(setlist.length > 0 && { setlist }),
    };

    writeJson(filePath, payload);
    written++;

    if (written % 500 === 0) process.stdout.write(`  shows: ${written}/${shows.length}\n`);
  }

  db.close();
  console.log(`✓ Exported ${written} GD shows`);
}

// ---------------------------------------------------------------------------
// Releases: releases.json → data/gd/releases/<collection>/<slug>.json
// ---------------------------------------------------------------------------

function detectCollection(title) {
  const t = title.toLowerCase();
  if (t.includes("dick's picks"))              return 'dicks-picks';
  if (t.includes("dave's picks"))              return 'daves-picks';
  if (t.includes('road trips'))                return 'road-trips';
  if (t.includes('download series'))           return 'download-series';
  if (t.includes('30 trips around the sun'))   return '30-trips-around-the-sun';
  if (t.includes("europe '72"))                return 'europe-72';
  if (t.includes('may 1977') || t.includes('get shown the light')) return 'may-1977';
  if (t.includes('pacific northwest') || t.includes('believe it if you need it')) return 'pacific-northwest';
  if (t.includes('july 1978'))                 return 'july-1978';
  if (t.includes('spring 1990'))               return 'spring-1990';
  if (t.includes('friend of the devils'))      return 'friend-of-the-devils';
  if (t.includes('listen to the river'))       return 'listen-to-the-river';
  if (t.includes('in and out of the garden'))  return 'in-and-out-of-the-garden';
  if (t.includes('giants stadium'))            return 'giants-stadium';
  if (t.includes('saint of circumstance'))     return 'saint-of-circumstance';
  if (t.includes('ready or not'))              return 'ready-or-not';
  if (t.includes("lyceum '72"))                return 'lyceum-1972';
  if (t.includes('winterland'))                return 'winterland';
  if (t.includes('here comes sunshine'))       return 'here-comes-sunshine';
  if (t.includes('view from the vault'))       return 'view-from-the-vault';
  if (t.includes('from the vault'))            return 'from-the-vault';
  if (t.includes('rocking the cradle'))        return 'rocking-the-cradle';
  if (t.includes("hunter's trix"))             return 'hunters-trix';
  return 'standalone';
}

function exportReleases() {
  const raw = JSON.parse(readFileSync(join(root, 'data', 'releases.json'), 'utf8'));

  // Track slugs per collection to avoid collisions
  const usedSlugs = new Map(); // collection → Set<slug>

  let written = 0;

  for (const entry of raw) {
    const collection = detectCollection(entry.title);
    if (!usedSlugs.has(collection)) usedSlugs.set(collection, new Set());
    const used = usedSlugs.get(collection);

    // Choose filename
    let baseSlug;
    if (entry.volume !== undefined) {
      baseSlug = `vol-${String(entry.volume).padStart(3, '0')}`;
    } else {
      baseSlug = titleSlug(entry.title).slice(0, 80);
    }

    // Resolve collisions
    let slug = baseSlug;
    let suffix = 2;
    while (used.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    used.add(slug);

    const filePath = join(root, 'data', 'gd', 'releases', collection, `${slug}.json`);

    const payload = {
      title: entry.title,
      ...(entry.volume !== undefined && { volume: entry.volume }),
      discUrl: entry.discUrl,
      ...(entry.imageUrl && { imageUrl: entry.imageUrl }),
      ...(entry.type === 'exact'
        ? { dates: entry.dates }
        : { startDate: entry.startDate, endDate: entry.endDate }),
    };

    writeJson(filePath, payload);
    written++;
  }

  console.log(`✓ Exported ${written} GD releases`);
}

// ---------------------------------------------------------------------------
// Dead & Company scaffold
// ---------------------------------------------------------------------------

function scaffoldDAC() {
  const dir = join(root, 'data', 'dac', 'shows');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '.gitkeep'), '');
    console.log('✓ Scaffolded data/dac/shows/ (add DAC shows here as YYYY/YYYY-MM-DD.json)');
  } else {
    console.log('✓ data/dac/shows/ already exists');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Exporting GD shows from SQLite...');
exportShows();

console.log('Exporting releases from releases.json...');
exportReleases();

console.log('Scaffolding Dead & Company data directory...');
scaffoldDAC();

console.log('\nDone. Next steps:');
console.log('  npm install   (installs Astro dependencies)');
console.log('  npm run dev   (starts dev server)');
