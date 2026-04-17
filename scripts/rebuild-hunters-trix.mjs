/**
 * Rebuilds all Hunter's Trix entries in releases.json using the authoritative
 * volume list from hunterstrix.com/the-list/ (143 volumes as of 2026-04).
 *
 * For each image file in public/images/collections/hunters-trix/:
 *   - Extracts the date from the filename
 *   - Finds the correct volume number from the authoritative list
 *   - Renames the file to hunters-trix-vol-{N}-{YYYY-MM-DD}.jpg
 *
 * Reports:
 *   - Files renamed
 *   - Files with no matching volume (orphans)
 *   - Volumes with no image file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const HUNTERS_TRIX_DIR = path.join(PROJECT_ROOT, 'public/images/collections/hunters-trix');
const RELEASES_PATH = path.join(PROJECT_ROOT, 'data/releases.json');

// Authoritative volume list from hunterstrix.com/the-list/ (fetched 2026-04-15)
const AUTHORITATIVE_VOLUMES = [
  { vol: 1,   date: '1982-08-10', venue: 'University of Iowa Fieldhouse, Iowa City, IA' },
  { vol: 2,   date: '1982-10-10', venue: 'Frost Amphitheatre, Palo Alto, CA' },
  { vol: 3,   date: '1983-10-17', venue: 'Olympic Arena, Lake Placid, NY' },
  { vol: 4,   date: '1984-04-26', venue: 'Providence Civic Center, Providence, RI' },
  { vol: 5,   date: '1976-06-17', venue: 'Capitol Theatre, Passaic, NJ' },
  { vol: 6,   date: '1976-06-03', venue: 'Paramount Theatre, Portland, OR' },
  { vol: 7,   date: '1981-05-08', venue: 'Nassau Coliseum, Uniondale, NY' },
  { vol: 8,   date: '1985-09-07', venue: 'Red Rocks Amphitheatre, Morrison, CO' },
  { vol: 9,   date: '1977-05-04', venue: 'The Palladium, New York, NY' },
  { vol: 10,  date: '1981-05-09', venue: 'Nassau Coliseum, Uniondale, NY' },
  { vol: 11,  date: '1977-11-06', venue: 'Broome County Arena, Binghamton, NY' },
  { vol: 12,  date: '1973-06-22', venue: 'P.N.E. Coliseum, Vancouver, BC' },
  { vol: 13,  date: '1985-06-27', venue: 'SPAC, Saratoga Springs, NY' },
  { vol: 14,  date: '1980-06-20', venue: 'West High Auditorium, Anchorage, AK' },
  { vol: 15,  date: '1982-10-09', venue: 'Frost Amphitheatre, Palo Alto, CA' },
  { vol: 16,  date: '1983-03-31', venue: 'Warfield Theatre, San Francisco, CA' },
  { vol: 17,  date: '1980-10-03', venue: 'Warfield Theatre, San Francisco, CA' },
  { vol: 18,  date: '1989-04-08', venue: 'Riverfront Coliseum, Cincinnati, OH' },
  { vol: 19,  date: '1979-12-28', venue: 'Oakland Auditorium Arena, Oakland, CA' },
  { vol: 20,  date: '1985-03-28', venue: 'Nassau Coliseum, Uniondale, NY' },
  { vol: 21,  date: '1978-04-19', venue: 'Veterans Memorial Auditorium, Columbus, OH' },
  { vol: 22,  date: '1985-09-03', venue: 'Starlight Theatre, Kansas City, MO' },
  { vol: 23,  date: '1985-06-30', venue: 'Merriweather Post Pavilion, Columbia, MD' },
  { vol: 24,  date: '1985-06-24', venue: 'Riverbend Music Center, Cincinnati, OH' },
  { vol: 25,  date: '1985-07-01', venue: 'Merriweather Post Pavilion, Columbia, MD' },
  { vol: 26,  date: '1978-10-21', venue: 'Winterland Arena, San Francisco, CA' },
  { vol: 27,  date: '1994-10-01', venue: 'Boston Garden, Boston, MA' },
  { vol: 28,  date: '1992-03-20', venue: 'Copps Coliseum, Hamilton, Ontario' },
  { vol: 29,  date: '1991-09-26', venue: 'Boston Garden, Boston, MA' },
  { vol: 30,  date: '1991-04-08', venue: 'Orlando Arena, Orlando, FL' },
  { vol: 31,  date: '1976-06-26', venue: 'Auditorium Theatre, Chicago, IL' },
  { vol: 32,  date: '1977-06-08', venue: 'Winterland Arena, San Francisco, CA' },
  { vol: 33,  date: '1980-09-04', venue: 'Providence Civic Center, Providence, RI' },
  { vol: 34,  date: '1979-07-01', venue: 'Seattle Center Coliseum, Seattle, WA' },
  { vol: 35,  date: '1983-09-06', venue: 'Red Rocks Amphitheatre, Morrison, CO' },
  { vol: 36,  date: '1985-11-11', venue: 'Brendan Byrne Arena, East Rutherford, NJ' },
  { vol: 37,  date: '1971-08-06', venue: 'Hollywood Palladium, Hollywood, CA' },
  { vol: 38,  date: '1983-04-09', venue: 'Hampton Coliseum, Hampton, VA' },
  { vol: 39,  date: '1977-04-23', venue: 'Springfield Civic Center, Springfield, MA' },
  { vol: 40,  date: '1977-05-08', venue: 'Barton Hall Cornell U., Ithaca, NY' },
  { vol: 41,  date: '1982-09-20', venue: 'Madison Square Garden, New York, NY' },
  { vol: 42,  date: '1982-09-21', venue: 'Madison Square Garden, New York, NY' },
  { vol: 43,  date: '1977-05-09', venue: 'Buffalo War Memorial, Buffalo, NY' },
  { vol: 44,  date: '1978-04-16', venue: 'Huntington Civic Center, Huntington, WV' },
  { vol: 45,  date: '1977-06-09', venue: 'Winterland Arena, San Francisco, CA' },
  { vol: 46,  date: '1977-06-07', venue: 'Winterland Arena, San Francisco, CA' },
  { vol: 47,  date: '1981-05-12', venue: 'Veterans Memorial Coliseum, New Haven, CT' },
  { vol: 48,  date: '1983-10-15', venue: 'Hartford Civic Center, Hartford, CT' },
  { vol: 49,  date: '1978-10-22', venue: 'Winterland Arena, San Francisco, CA' },
  { vol: 50,  date: '1973-06-26', venue: 'Seattle Center Arena, Seattle, WA' },
  { vol: 51,  date: '1973-07-27', venue: 'Grand Prix Racecourse, Watkins Glen, NY' },
  { vol: 52,  date: '1974-08-04', venue: 'Philadelphia Civic Center, Philadelphia, PA' },
  { vol: 53,  date: '1983-09-02', venue: 'Boise Pavilion Boise State U., Boise, ID' },
  { vol: 54,  date: '1981-03-09', venue: 'Madison Square Garden, New York, NY' },
  { vol: 55,  date: '1982-05-22', venue: 'Greek Theatre U. of California, Berkeley, CA' },
  { vol: 56,  date: '1982-05-23', venue: 'Greek Theatre U. of California, Berkeley, CA' },
  { vol: 57,  date: '1980-10-26', venue: 'Radio City Music Hall, New York, NY' },
  { vol: 58,  date: '1982-08-06', venue: 'St. Paul Civic Center, St. Paul, MN' },
  { vol: 59,  date: '1975-09-28', venue: 'Golden Gate Park, San Francisco, CA' },
  { vol: 60,  date: '1989-10-20', venue: 'The Spectrum, Philadelphia, PA' },
  { vol: 61,  date: '1989-10-22', venue: 'Charlotte Coliseum, Charlotte, NC' },
  { vol: 62,  date: '1989-10-23', venue: 'Charlotte Coliseum, Charlotte, NC' },
  { vol: 63,  date: '1979-09-05', venue: 'Madison Square Garden, New York, NY' },
  { vol: 64,  date: '1972-09-09', venue: 'Hollywood Palladium, Hollywood, CA' },
  { vol: 65,  date: '1979-10-27', venue: 'Cape Cod Coliseum, South Yarmouth, MA' },
  { vol: 66,  date: '1979-10-28', venue: 'Cape Cod Coliseum, South Yarmouth, MA' },
  { vol: 67,  date: '1984-07-13', venue: 'Greek Theatre U. of California, Berkeley, CA' },
  { vol: 68,  date: '1974-06-22', venue: 'Jai-Alai Fronton, Miami, FL' },
  { vol: 69,  date: '1974-06-23', venue: 'Jai-Alai Fronton, Miami, FL' },
  { vol: 70,  date: '1985-06-25', venue: 'Blossom Music Center, Cuyahoga Falls, OH' },
  { vol: 71,  date: '1982-04-18', venue: 'Hartford Civic Center, Hartford, CT' },
  { vol: 72,  date: '1981-05-01', venue: 'Hampton Coliseum, Hampton, VA' },
  { vol: 73,  date: '1981-05-11', venue: 'Veterans Memorial Coliseum, New Haven, CT' },
  { vol: 74,  date: '1974-07-29', venue: 'Capital Centre, Landover, MD' },
  { vol: 75,  date: '1981-05-16', venue: 'Barton Hall Cornell U., Ithaca, NY' },
  { vol: 76,  date: '1985-06-21', venue: 'Alpine Valley Music Theatre, East Troy, WI' },
  { vol: 77,  date: '1985-06-22', venue: 'Alpine Valley Music Theatre, East Troy, WI' },
  { vol: 78,  date: '1978-05-17', venue: 'Uptown Theatre, Chicago, IL' },
  { vol: 79,  date: '1974-05-21', venue: 'Edmundson Pavilion, Seattle, WA' },
  { vol: 80,  date: '1977-02-26', venue: 'Swing Auditorium, San Bernardino, CA' },
  { vol: 81,  date: '1981-10-16', venue: 'Melkweg, Amsterdam, Netherlands' },
  { vol: 82,  date: '1991-03-20', venue: 'Capital Centre, Landover, MD' },
  { vol: 83,  date: '1991-03-21', venue: 'Capital Centre, Landover, MD' },
  { vol: 84,  date: '1980-06-21', venue: 'West High Auditorium, Anchorage, AK' },
  { vol: 85,  date: '1979-12-05', venue: 'Uptown Theatre, Chicago, IL' },
  { vol: 86,  date: '1976-06-28', venue: 'Auditorium Theatre, Chicago, IL' },
  { vol: 87,  date: '1976-06-29', venue: 'Auditorium Theatre, Chicago, IL' },
  { vol: 88,  date: '1988-03-16', venue: 'Henry J. Kaiser Convention Center, Oakland, CA' },
  { vol: 89,  date: '1976-06-22', venue: 'Tower Theatre, Upper Darby, PA' },
  { vol: 90,  date: '1990-03-22', venue: 'Copps Coliseum, Hamilton, Ontario' },
  { vol: 91,  date: '1979-11-24', venue: 'Golden Hall, San Diego, CA' },
  { vol: 92,  date: '1983-04-13', venue: 'Patrick Gymnasium, Burlington, VT' },
  { vol: 93,  date: '1984-10-12', venue: 'Augusta Civic Center, Augusta, ME' },
  { vol: 94,  date: '1986-02-11', venue: 'Henry J. Kaiser Convention Center, Oakland, CA' },
  { vol: 95,  date: '1976-06-11', venue: 'Boston Music Hall, Boston, MA' },
  { vol: 96,  date: '1994-10-14', venue: 'Madison Square Garden, New York, NY' },
  { vol: 97,  date: '1993-03-11', venue: 'Rosemont Horizon, Rosemont, IL' },
  { vol: 98,  date: '1976-06-21', venue: 'Tower Theatre, Upper Darby, PA' },
  { vol: 99,  date: '1976-06-19', venue: 'Capitol Theatre, Passaic, NJ' },
  { vol: 100, date: '1979-08-13', venue: 'McNichols Sports Arena, Denver, CO' },
  { vol: 101, date: '1979-11-02', venue: 'Nassau Coliseum, Uniondale, NY' },
  { vol: 102, date: '1979-11-01', venue: 'Nassau Coliseum, Uniondale, NY' },
  { vol: 103, date: '1984-07-15', venue: 'Greek Theatre U. of California, Berkeley, CA' },
  { vol: 104, date: '1983-10-21', venue: 'The Centrum, Worcester, MA' },
  // Vol 105 (1982-04-10, Capitol Theatre) omitted — Solo Jerry show, not a GD concert
  { vol: 106, date: '1973-07-01', venue: 'Universal Amphitheatre, Universal City, CA' },
  { vol: 107, date: '1981-02-27', venue: 'Uptown Theatre, Chicago, IL' },
  { vol: 108, date: '1981-03-10', venue: 'Madison Square Garden, New York, NY' },
  { vol: 109, date: '1984-05-08', venue: 'Hult Center Silva Hall, Eugene, OR' },
  { vol: 110, date: '1974-02-24', venue: 'Winterland, San Francisco, CA' },
  { vol: 111, date: '1982-02-17', venue: 'Warfield Theatre, San Francisco, CA' },
  { vol: 112, date: '1983-09-10', venue: 'Santa Fe Downs, Santa Fe, NM' },
  { vol: 113, date: '1977-03-19', venue: 'Winterland, San Francisco, CA' },
  { vol: 114, date: '1977-03-18', venue: 'Winterland, San Francisco, CA' },
  { vol: 115, date: '1990-09-16', venue: 'Madison Square Garden, New York, NY' },
  { vol: 116, date: '1982-09-11', venue: 'West Palm Beach Auditorium, West Palm Beach, FL' },
  { vol: 117, date: '1979-09-02', venue: 'Augusta Civic Center, Augusta, ME' },
  { vol: 118, date: '1978-04-08', venue: 'Veterans Memorial Coliseum, Jacksonville, FL' },
  { vol: 119, date: '1974-06-26', venue: 'Providence Civic Center, Providence, RI' },
  { vol: 120, date: '1974-06-28', venue: 'Boston Garden, Boston, MA' },
  { vol: 121, date: '1991-04-07', venue: 'Orlando Arena, Orlando, FL' },
  { vol: 122, date: '1984-07-22', venue: 'Ventura County Fairgrounds, Ventura, CA' },
  { vol: 123, date: '1986-02-14', venue: 'Henry J. Kaiser Convention Center, Oakland, CA' },
  { vol: 124, date: '1982-09-18', venue: 'Boston Garden, Boston, MA' },
  { vol: 125, date: '1985-09-15', venue: 'DeVore Field Southwestern College, Chula Vista, CA' },
  { vol: 126, date: '1984-10-15', venue: 'Hartford Civic Center, Hartford, CT' },
  { vol: 127, date: '1981-05-13', venue: 'Providence Civic Center, Providence, RI' },
  { vol: 128, date: '1981-05-15', venue: 'Rutgers Athletic Center, Piscataway, NJ' },
  { vol: 129, date: '1983-09-11', venue: 'Santa Fe Downs, Santa Fe, NM' },
  { vol: 130, date: '1990-09-18', venue: 'Madison Square Garden, New York, NY' },
  { vol: 131, date: '1990-09-20', venue: 'Madison Square Garden, New York, NY' },
  { vol: 132, date: '1982-09-17', venue: 'Cumberland County Civic Center, Portland, ME' },
  { vol: 133, date: '1993-03-27', venue: 'Knickerbocker Arena, Albany, NY' },
  { vol: 134, date: '1980-06-19', venue: 'West High Auditorium, Anchorage, AK' },
  { vol: 135, date: '1984-07-21', venue: 'Ventura County Fairgrounds, Ventura, CA' },
  { vol: 136, date: '1993-03-28', venue: 'Knickerbocker Arena, Albany, NY' },
  { vol: 137, date: '1993-03-29', venue: 'Knickerbocker Arena, Albany, NY' },
  { vol: 138, date: '1979-12-26', venue: 'Oakland Auditorium Arena, Oakland, CA' },
  { vol: 139, date: '1983-10-14', venue: 'Hartford Civic Center, Hartford, CT' },
  { vol: 140, date: '1989-04-17', venue: 'Metropolitan Sports Center, Bloomington, MN' },
  { vol: 141, date: '1976-06-09', venue: 'Boston Music Hall, Boston, MA' },
  { vol: 142, date: '1984-07-14', venue: 'Greek Theatre U. of California, Berkeley, CA' },
  { vol: 143, date: '1985-10-29', venue: 'Fox Theatre, Atlanta, GA' },
  // Volumes 144-177 from hunterstrix.com (fetched 2026-04-16)
  { vol: 144, date: '1989-10-09', venue: 'Hampton Coliseum, Hampton, VA' },
  { vol: 145, date: '1985-10-28', venue: 'Fox Theatre, Atlanta, GA' },
  { vol: 146, date: '1981-11-30', venue: 'Hara Arena, Dayton, OH' },
  { vol: 147, date: '1981-12-02', venue: 'Assembly Hall, University of Illinois, Champaign, IL' },
  { vol: 148, date: '1981-12-03', venue: 'Dane County Coliseum, Madison, WI' },
  { vol: 149, date: '1981-12-05', venue: 'Market Square Arena, Indianapolis, IN' },
  { vol: 150, date: '1981-12-06', venue: 'Rosemont Horizon, Rosemont, IL' },
  { vol: 151, date: '1981-12-07', venue: 'Des Moines Civic Center, Des Moines, IA' },
  { vol: 152, date: '1981-12-09', venue: 'CU Events Center, Boulder, CO' },
  { vol: 153, date: '1989-06-19', venue: 'Shoreline Amphitheatre, Mountain View, CA' },
  { vol: 154, date: '1990-07-12', venue: 'Robert F. Kennedy Stadium, Washington, DC' },
  { vol: 155, date: '1984-04-14', venue: 'Hampton Coliseum, Hampton, VA' },
  { vol: 156, date: '1979-12-01', venue: 'Stanley Theatre, Pittsburgh, PA' },
  { vol: 157, date: '1982-04-03', venue: 'The Scope, Norfolk, VA' },
  { vol: 158, date: '1989-12-27', venue: 'Oakland Coliseum Arena, Oakland, CA' },
  { vol: 159, date: '1989-12-28', venue: 'Oakland Coliseum Arena, Oakland, CA' },
  { vol: 160, date: '1989-12-30', venue: 'Oakland Coliseum Arena, Oakland, CA' },
  { vol: 161, date: '1989-12-31', venue: 'Oakland Coliseum Arena, Oakland, CA' },
  { vol: 162, date: '1982-08-07', venue: 'Alpine Valley Music Theatre, East Troy, WI' },
  { vol: 163, date: '1979-12-10', venue: 'Soldiers and Sailors Memorial Hall, Kansas City, KS' },
  { vol: 164, date: '1984-04-19', venue: 'Philadelphia Civic Center, Philadelphia, PA' },
  { vol: 165, date: '1984-04-20', venue: 'Philadelphia Civic Center, Philadelphia, PA' },
  { vol: 166, date: '1984-04-21', venue: 'Philadelphia Civic Center, Philadelphia, PA' },
  { vol: 167, date: '1991-05-10', venue: 'Shoreline Amphitheatre, Mountain View, CA' },
  { vol: 168, date: '1989-04-15', venue: 'MECCA Arena, Milwaukee, WI' },
  { vol: 169, date: '1989-04-16', venue: 'MECCA Arena, Milwaukee, WI' },
  { vol: 170, date: '1983-10-11', venue: 'Madison Square Garden, New York, NY' },
  { vol: 171, date: '1983-10-12', venue: 'Madison Square Garden, New York, NY' },
  { vol: 172, date: '1978-04-12', venue: 'Cameron Indoor Stadium, Durham, NC' },
  { vol: 173, date: '1983-09-04', venue: 'Park West Ski Resort, Park City, UT' },
  { vol: 174, date: '1976-10-01', venue: 'Market Square Arena, Indianapolis, IN' },
  { vol: 175, date: '1981-02-26', venue: 'Uptown Theatre, Chicago, IL' },
  { vol: 176, date: '1981-02-28', venue: 'Uptown Theatre, Chicago, IL' },
  { vol: 177, date: '1976-09-27', venue: 'Rochester War Memorial, Rochester, NY' },
  // Vols 178-179 confirmed via hunterstrix.com Facebook posts
  { vol: 178, date: '1991-03-27', venue: 'Nassau Veterans Memorial Coliseum, Uniondale, NY' },
  { vol: 179, date: '1984-04-17', venue: 'Niagara Falls Civic Center, Niagara Falls, NY' },
];

// Build date → volume lookup
const dateToVol = {};
for (const v of AUTHORITATIVE_VOLUMES) {
  if (dateToVol[v.date]) {
    console.warn(`WARNING: duplicate date ${v.date} in authoritative list (Vol ${dateToVol[v.date].vol} and Vol ${v.vol})`);
  }
  dateToVol[v.date] = v;
}

// Extract date from image filename
function parseDateFromFilename(filename) {
  // Already-normalized: hunters-trix-vol-N-YYYY-MM-DD.jpg
  const normMatch = filename.match(/^hunters-trix-vol-\d+-(\d{4}-\d{2}-\d{2})\.jpg$/i);
  if (normMatch) return normMatch[1];

  // Artist - YY-MM-DD - Venue.jpg
  const shortMatch = filename.match(/- (\d{2})-(\d{2})-(\d{2}) -/);
  if (shortMatch) {
    const [, yy, mm, dd] = shortMatch;
    return `19${yy}-${mm}-${dd}`;
  }

  return null;
}

// Collect all image files and their dates
const imageFiles = fs.readdirSync(HUNTERS_TRIX_DIR)
  .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

// Group by date to detect duplicates
const byDate = {};
for (const filename of imageFiles) {
  const date = parseDateFromFilename(filename);
  const key = date ?? '__no_date__';
  if (!byDate[key]) byDate[key] = [];
  byDate[key].push(filename);
}

const renamed = [];
const orphans = [];
const duplicatesRemoved = [];

// Process each date group
for (const [date, files] of Object.entries(byDate)) {
  if (date === '__no_date__') {
    for (const f of files) orphans.push({ filename: f, reason: 'Could not parse date from filename' });
    continue;
  }

  const vol = dateToVol[date];
  if (!vol) {
    for (const f of files) orphans.push({ filename: f, date, reason: 'No Hunter\'s Trix volume for this date in authoritative list' });
    continue;
  }

  const newFilename = `hunters-trix-vol-${vol.vol}-${date}.jpg`;

  // Separate already-correct files from ones that need renaming
  const alreadyCorrect = files.find(f => f === newFilename);
  const toRename = files.filter(f => f !== newFilename);

  if (alreadyCorrect) {
    // File is already named correctly; remove any extras
    for (const f of toRename) {
      fs.unlinkSync(path.join(HUNTERS_TRIX_DIR, f));
      duplicatesRemoved.push({ removed: f, kept: newFilename, vol: vol.vol });
    }
  } else {
    // Rename the first file; remove extras
    const src = files[0];
    const srcPath = path.join(HUNTERS_TRIX_DIR, src);
    const dstPath = path.join(HUNTERS_TRIX_DIR, newFilename);
    fs.renameSync(srcPath, dstPath);
    renamed.push({ old: src, new: newFilename, vol: vol.vol, date, venue: vol.venue });

    for (let i = 1; i < files.length; i++) {
      fs.unlinkSync(path.join(HUNTERS_TRIX_DIR, files[i]));
      duplicatesRemoved.push({ removed: files[i], kept: newFilename, vol: vol.vol });
    }
  }

  // Set the imageUrl on the volume entry (used later for releases.json)
  vol.imageUrl = `/images/collections/hunters-trix/${newFilename}`;
}

// Rebuild releases.json: remove old HT entries, add 143 authoritative ones
const releases = JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'));
const nonHT = releases.filter(r => !r.title?.startsWith("Hunter's Trix Vol."));

const newHTEntries = AUTHORITATIVE_VOLUMES.map(v => ({
  type: 'exact',
  dates: [v.date],
  title: `Hunter's Trix Vol. ${v.vol}: ${v.venue}`,
  discUrl: `https://archive.org/search.php?query=collection%3AGratefulDead%20AND%20title%3A%22Hunter%27s%20Trix%20Vol.%20${v.vol}%22`,
  volume: v.vol,
  ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
}));

const updatedReleases = [...nonHT, ...newHTEntries];
fs.writeFileSync(RELEASES_PATH, JSON.stringify(updatedReleases, null, 2));

// Volumes without images
const volumesWithoutImages = AUTHORITATIVE_VOLUMES.filter(v => !v.imageUrl);

// --- Report ---
console.log(`\n=== RENAMED ${renamed.length} FILES ===`);
for (const r of renamed) {
  console.log(`  Vol ${String(r.vol).padStart(3)}: ${r.old}`);
  console.log(`           → ${r.new}`);
}

if (duplicatesRemoved.length) {
  console.log(`\n=== REMOVED ${duplicatesRemoved.length} DUPLICATE FILES ===`);
  for (const d of duplicatesRemoved) {
    console.log(`  Vol ${d.vol}: removed ${d.removed} (kept ${d.kept})`);
  }
}

console.log(`\n=== ${orphans.length} ORPHAN IMAGES (no matching volume) ===`);
for (const o of orphans) {
  console.log(`  ${o.filename}${o.date ? ` (${o.date})` : ''}`);
  console.log(`    Reason: ${o.reason}`);
}

console.log(`\n=== ${volumesWithoutImages.length} VOLUMES WITHOUT IMAGE FILES ===`);
for (const v of volumesWithoutImages) {
  console.log(`  Vol ${String(v.vol).padStart(3)}: ${v.date}  ${v.venue}`);
}

console.log(`\nreleases.json updated: removed old HT entries, added ${newHTEntries.length} authoritative entries.`);
console.log(`Done.`);
