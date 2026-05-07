/**
 * Badge metadata for GD release collections.
 *
 * Key = collection slug (matches directory name under data/gd/releases/).
 * abbr = short label shown in the UI badge.
 * cls  = Tailwind classes for background + text color.
 *
 * To add a new collection: add it here AND create the directory
 * data/gd/releases/<slug>/ with release JSON files inside.
 */
export interface BadgeInfo {
  name: string;     // human-readable display name
  abbr: string;     // short badge label
  cls: string;      // Tailwind bg + text classes
}

export const BADGES: Record<string, BadgeInfo> = {
  'dicks-picks':              { name: "Dick's Picks",              abbr: 'DiP', cls: 'bg-rose-800 text-rose-100' },
  'daves-picks':              { name: "Dave's Picks",              abbr: 'DaP', cls: 'bg-blue-800 text-blue-100' },
  'road-trips':               { name: 'Road Trips',                abbr: 'RT',  cls: 'bg-green-800 text-green-100' },
  'download-series':          { name: 'Download Series',           abbr: 'DL',  cls: 'bg-purple-800 text-purple-100' },
  'hunters-trix':             { name: "Hunter's Trix",             abbr: 'HT',  cls: 'bg-orange-700 text-orange-100' },
  '30-trips-around-the-sun':  { name: '30 Trips Around The Sun',   abbr: '30T', cls: 'bg-amber-700 text-amber-100' },
  'europe-72':                { name: "Europe '72",                abbr: 'E72', cls: 'bg-teal-700 text-teal-100' },
  'from-the-vault':           { name: 'From The Vault',            abbr: 'FtV', cls: 'bg-slate-600 text-slate-100' },
  'view-from-the-vault':      { name: 'View From The Vault',       abbr: 'VtV', cls: 'bg-slate-500 text-slate-100' },
  'may-1977':                 { name: 'May 1977',                  abbr: 'M77', cls: 'bg-pink-800 text-pink-100' },
  'get-shown-the-light':      { name: 'Get Shown The Light',        abbr: 'GSL', cls: 'bg-pink-700 text-pink-100' },
  'pacific-northwest':        { name: 'Pacific Northwest',         abbr: 'PNW', cls: 'bg-emerald-800 text-emerald-100' },
  'july-1978':                { name: 'July 1978',                 abbr: 'J78', cls: 'bg-yellow-700 text-yellow-100' },
  'spring-1990':              { name: 'Spring 1990',               abbr: 'S90', cls: 'bg-lime-700 text-lime-100' },
  'friend-of-the-devils':     { name: 'Friend Of The Devils',      abbr: 'FoD', cls: 'bg-red-800 text-red-100' },
  'listen-to-the-river':      { name: 'Listen To The River',       abbr: 'LtR', cls: 'bg-cyan-800 text-cyan-100' },
  'in-and-out-of-the-garden': { name: 'In And Out Of The Garden',  abbr: 'IOG', cls: 'bg-violet-800 text-violet-100' },
  'giants-stadium':           { name: 'Giants Stadium',            abbr: 'GS',  cls: 'bg-sky-800 text-sky-100' },
  'saint-of-circumstance':    { name: 'Saint Of Circumstance',     abbr: 'SoC', cls: 'bg-fuchsia-800 text-fuchsia-100' },
  'ready-or-not':             { name: 'Ready Or Not',              abbr: 'RoN', cls: 'bg-rose-700 text-rose-100' },
  'lyceum-1972':              { name: 'Lyceum 1972',               abbr: 'Lyc', cls: 'bg-teal-800 text-teal-100' },
  'winterland':               { name: 'Winterland',                abbr: 'Wtr', cls: 'bg-gray-600 text-gray-100' },
  'here-comes-sunshine':      { name: 'Here Comes Sunshine',       abbr: 'HCS', cls: 'bg-yellow-800 text-yellow-100' },
  'rocking-the-cradle':       { name: 'Rocking The Cradle',        abbr: 'RtC', cls: 'bg-orange-800 text-orange-100' },
  'standalone':               { name: 'Other Releases',            abbr: 'Rel', cls: 'bg-gray-700 text-gray-100' },
};

export function getBadge(slug: string): BadgeInfo {
  return BADGES[slug] ?? { name: slug, abbr: '?', cls: 'bg-gray-700 text-gray-100' };
}

/** All known collection slugs (excluding standalone). */
export const COLLECTION_SLUGS = Object.keys(BADGES).filter(k => k !== 'standalone');
