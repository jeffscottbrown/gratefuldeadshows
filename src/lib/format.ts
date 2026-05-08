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
  UK: 'United Kingdom',
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
  ES: 'Spain',
  PT: 'Portugal',
  AT: 'Austria',
  PL: 'Poland',
  CZ: 'Czech Republic',
  LU: 'Luxembourg',
  NZ: 'New Zealand',
  MX: 'Mexico',
  EG: 'Egypt',
  JM: 'Jamaica',
};

export function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'Washington D.C.',
};

export function stateLabel(code: string): string {
  return US_STATE_NAMES[code] ?? code;
}

/** Cities that appear in more than one US state — require state-qualified URLs. */
export const AMBIGUOUS_CITIES = new Set([
  'Bloomington',
  'Columbia',
  'Hollywood',
  'Kansas City',
  'Portland',
]);

/**
 * Returns the canonical URL for a city page.
 * Ambiguous cities (same name in multiple states) use /cities/[state]/[city].
 * All others use /cities/[city].
 */
export function cityUrl(city: string, state: string): string {
  if (state && AMBIGUOUS_CITIES.has(city)) {
    return `/cities/${encodeURIComponent(state)}/${encodeURIComponent(city)}`;
  }
  return `/cities/${encodeURIComponent(city)}`;
}
