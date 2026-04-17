import fs from 'fs';
import path from 'path';

const RELEASES_PATH = path.join(process.cwd(), 'data', 'releases.json');
const rawData = JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'));

function extractVolume(title) {
  const t = title.toLowerCase();

  // Dick's Picks, Vol. 22
  let match = title.match(/Dick's Picks, Vol\. (\d+)/i);
  if (match) return parseInt(match[1], 10);

  // Dave's Picks Volume 10
  match = title.match(/Dave's Picks Volume (\d+)/i);
  if (match) return parseInt(match[1], 10);

  // Dave's Picks, Vol. 43
  match = title.match(/Dave's Picks, Vol\. (\d+)/i);
  if (match) return parseInt(match[1], 10);

  // Dave's Picks Vol 19
  match = title.match(/Dave's Picks Vol (\d+)/i);
  if (match) return parseInt(match[1], 10);

  // Road Trips: Vol 2, No 2
  // We'll use a decimal for Road Trips: Vol.No (e.g. 2.2)
  match = title.match(/Road Trips: Vol (\d+), No\.? (\d+)/i);
  if (match) return parseFloat(`${match[1]}.${match[2]}`);

  // Download Series, Vol. 6
  match = title.match(/Download Series, Vol\. (\d+)/i);
  if (match) return parseInt(match[1], 10);

  // Hunter's Trix Vol. 1
  match = title.match(/Hunter's Trix Vol\.? (\d+)/i);
  if (match) return parseInt(match[1], 10);

  return null;
}

const normalized = rawData.map(entry => {
  const volume = extractVolume(entry.title);
  if (volume !== null) {
    return { ...entry, volume };
  }
  return entry;
});

fs.writeFileSync(RELEASES_PATH, JSON.stringify(normalized, null, 2));
console.log(`Normalized ${normalized.length} releases.`);
