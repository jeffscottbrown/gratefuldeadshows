import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const HUNTERS_TRIX_DIR = path.join(PROJECT_ROOT, 'public/images/collections/hunters-trix');
const RELEASES_PATH = path.join(PROJECT_ROOT, 'data/releases.json');

// Parse date from filename like "Grateful Dead - 82-08-10 - U. of Iowa Fieldhouse.jpg"
// Also handles already-normalized "hunters-trix-vol-N-YYYY-MM-DD.jpg"
function parseDateFromFilename(filename) {
  // Already-normalized format: hunters-trix-vol-N-YYYY-MM-DD.jpg
  const normalizedMatch = filename.match(/^hunters-trix-vol-\d+-(\d{4}-\d{2}-\d{2})\.jpg$/);
  if (normalizedMatch) return normalizedMatch[1];

  // Original format: "Artist - YY-MM-DD - Venue.jpg"
  const match = filename.match(/- (\d{2})-(\d{2})-(\d{2}) -/);
  if (!match) return null;
  const [, yy, mm, dd] = match;
  return `19${yy}-${mm}-${dd}`;
}

const releases = JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'));
const htVolumes = releases.filter(r => r.title && r.title.startsWith("Hunter's Trix Vol."));

// Build date → volume map (Hunter's Trix dates are unique)
const dateToVolume = {};
for (const vol of htVolumes) {
  if (vol.dates?.length > 0) {
    const date = vol.dates[0];
    if (dateToVolume[date]) {
      console.warn(`WARNING: duplicate HT date ${date}: "${dateToVolume[date].title}" and "${vol.title}"`);
    }
    dateToVolume[date] = vol;
  }
}

const imageFiles = fs.readdirSync(HUNTERS_TRIX_DIR)
  .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

// Group images by parsed date to detect duplicates
const imagesByDate = {};
for (const filename of imageFiles) {
  const date = parseDateFromFilename(filename);
  const key = date ?? '__no_date__';
  if (!imagesByDate[key]) imagesByDate[key] = [];
  imagesByDate[key].push(filename);
}

const renamed = [];
const unmatched = [];
const duplicateDates = [];

// Process each unique date
for (const [date, files] of Object.entries(imagesByDate)) {
  if (date === '__no_date__') {
    for (const f of files) unmatched.push({ filename: f, reason: 'Could not parse date from filename' });
    continue;
  }

  const vol = dateToVolume[date];
  if (!vol) {
    for (const f of files) unmatched.push({ filename: f, date, reason: 'No Hunter\'s Trix volume for this date' });
    continue;
  }

  const volMatch = vol.title.match(/Vol\. (\d+)/);
  const volNum = volMatch ? parseInt(volMatch[1]) : null;
  if (!volNum) {
    for (const f of files) unmatched.push({ filename: f, date, reason: 'Could not parse volume number' });
    continue;
  }

  if (files.length > 1) {
    duplicateDates.push({ date, vol: vol.title, files });
    // Still use the first file but note the conflict
  }

  const srcFilename = files[0];
  const newFilename = `hunters-trix-vol-${volNum}-${date}.jpg`;
  const oldPath = path.join(HUNTERS_TRIX_DIR, srcFilename);
  const newPath = path.join(HUNTERS_TRIX_DIR, newFilename);

  if (srcFilename !== newFilename) {
    fs.renameSync(oldPath, newPath);
    renamed.push({ old: srcFilename, new: newFilename, vol: vol.title });
    // Remove extra copies if any
    for (let i = 1; i < files.length; i++) {
      fs.unlinkSync(path.join(HUNTERS_TRIX_DIR, files[i]));
    }
  }

  vol.imageUrl = `/images/collections/hunters-trix/${newFilename}`;
}

// Volumes without any matching image
const matchedDates = new Set(
  Object.keys(imagesByDate).filter(d => d !== '__no_date__' && dateToVolume[d])
);
const volumesWithoutImages = htVolumes.filter(vol =>
  vol.dates?.length > 0 && !matchedDates.has(vol.dates[0])
);

fs.writeFileSync(RELEASES_PATH, JSON.stringify(releases, null, 2));

// --- Report ---
console.log(`\n=== RENAMED ${renamed.length} FILES ===`);
for (const r of renamed) {
  console.log(`  [${r.vol}]`);
  console.log(`    ${r.old}`);
  console.log(`    → ${r.new}`);
}

if (duplicateDates.length) {
  console.log(`\n=== ${duplicateDates.length} DUPLICATE DATES (multiple images for same date) ===`);
  for (const d of duplicateDates) {
    console.log(`  ${d.date} [${d.vol}]: ${d.files.join(', ')}`);
  }
}

console.log(`\n=== ${unmatched.length} UNMATCHED IMAGES (no Hunter's Trix volume for this date) ===`);
for (const u of unmatched) {
  console.log(`  ${u.filename}${u.date ? ` (${u.date})` : ''} — ${u.reason}`);
}

console.log(`\n=== ${volumesWithoutImages.length} HUNTER'S TRIX VOLUMES WITHOUT IMAGES ===`);
for (const v of volumesWithoutImages) {
  const volMatch = v.title.match(/Vol\. (\d+)/);
  const n = volMatch ? volMatch[1].padStart(3, ' ') : '???';
  console.log(`  Vol ${n}: ${v.dates[0]}  ${v.title}`);
}

console.log(`\nDone. releases.json updated.`);
