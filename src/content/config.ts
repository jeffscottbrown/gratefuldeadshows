/**
 * Astro Content Collection schemas.
 *
 * Shows live in:
 *   data/gd/shows/YYYY/YYYY-MM-DD.json
 *   data/dac/shows/YYYY/YYYY-MM-DD.json
 *
 * Releases live in:
 *   data/gd/releases/<collection-slug>/<vol-or-title>.json
 *
 * To add a new GD show:
 *   create data/gd/shows/1973/1973-02-09.json
 *
 * To add a new Dead & Company show:
 *   create data/dac/shows/2019/2019-06-14.json
 *
 * To add a new release (e.g. Dave's Picks Vol. 53):
 *   create data/gd/releases/daves-picks/vol-053.json
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Setlist entry ──────────────────────────────────────────────────────────
// set: 1 = Set 1, 2 = Set 2, 3 = Set 3, 99 = Encore
const setSchema = z.object({
  set: z.number().int(),
  songs: z.array(z.string()),
});

// ── Show schema (shared by GD and DAC) ────────────────────────────────────
const showSchema = z.object({
  venue: z.string(),
  city: z.string(),
  state: z.string().default(''),
  country: z.string(),
  setlist: z.array(setSchema).default([]),
  notes: z.string().optional(),
});

// ── Release schema ─────────────────────────────────────────────────────────
// Either `dates` (exact show dates) or `startDate`+`endDate` (multi-show range).
const releaseSchema = z
  .object({
    title: z.string(),
    volume: z.number().optional(),
    discUrl: z.string().url(),
    imageUrl: z.string().optional(),
    // Exact show dates this release covers
    dates: z.array(z.string()).optional(),
    // OR a date range (e.g. a box set covering a full tour run)
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (d) => d.dates !== undefined || (d.startDate !== undefined && d.endDate !== undefined),
    { message: 'Release must have either dates[] or startDate+endDate' },
  );

export const collections = {
  // Grateful Dead shows: data/gd/shows/YYYY/YYYY-MM-DD.json
  'gd-shows': defineCollection({
    loader: glob({ pattern: '**/*.json', base: './data/gd/shows' }),
    schema: showSchema,
  }),

  // Dead & Company shows: data/dac/shows/YYYY/YYYY-MM-DD.json
  'dac-shows': defineCollection({
    loader: glob({ pattern: '**/*.json', base: './data/dac/shows' }),
    schema: showSchema,
  }),

  // Official GD releases: data/gd/releases/<collection-slug>/<volume>.json
  // The collection slug is the first path segment of the entry id.
  'gd-releases': defineCollection({
    loader: glob({ pattern: '**/*.json', base: './data/gd/releases' }),
    schema: releaseSchema,
  }),
};
