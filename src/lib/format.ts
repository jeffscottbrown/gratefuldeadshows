/** Date and string utilities shared between server and client code. */

/**
 * Format "YYYY-MM-DD" (or "YYYY-MM-DD-2") as a human-readable date string.
 * The optional `weekday` param matches Intl.DateTimeFormatOptions.
 */
export function formatDate(
  slug: string,
  weekday: 'long' | 'short' | undefined = undefined,
): string {
  const dateStr = slug.slice(0, 10); // strip any -2 suffix
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    ...(weekday && { weekday }),
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Extract the clean YYYY-MM-DD date from a show slug (strips -2, -3 suffixes). */
export function slugToDate(slug: string): string {
  return slug.slice(0, 10);
}

/** Extract YYYY year from a slug or date string. */
export function slugToYear(slug: string): string {
  return slug.slice(0, 4);
}

/** URL-safe slug for a song title. */
export function songSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** URL-safe slug for a collection name (mirrors the directory name). */
export function collectionSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map set number to display label. */
export function setLabel(n: number): string {
  if (n === 99) return 'Encore';
  return `Set ${n}`;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  CA: 'Canada',
  AU: 'Australia',
  JP: 'Japan',
  IE: 'Ireland',
  CH: 'Switzerland',
  BE: 'Belgium',
  DK: 'Denmark',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  IT: 'Italy',
  AT: 'Austria',
  NZ: 'New Zealand',
  MX: 'Mexico',
  EG: 'Egypt',
};

export function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}
