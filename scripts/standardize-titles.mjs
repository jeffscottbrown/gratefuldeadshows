import fs from 'fs';
import path from 'path';

const RELEASES_PATH = path.join(process.cwd(), 'data', 'releases.json');
const rawData = JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'));

// Note: Dave's Picks and Hunter's Trix are already handled by specialized scripts.
// Let's handle Dick's Picks, Road Trips, and Download Series.

function standardize(entry) {
  let { title } = entry;

  // Dick's Picks
  // Current: "Dick's Picks, Vol. 22"
  // Desired: "Dick's Picks Volume 22" (adding venue info if possible is harder without a full list,
  // but let's at least make the prefix consistent)
  if (title.includes("Dick's Picks")) {
    const match = title.match(/Dick's Picks,? Vol\.? (\d+)/i);
    if (match) {
      // For Dick's Picks, they usually don't have the venue in the official title on the cover,
      // but let's at least standardize the prefix.
      title = `Dick's Picks Volume ${match[1]}`;
    }
  }

  // Download Series
  // Current: "Download Series, Vol. 6: 3/17/68"
  // Desired: "Download Series Volume 6"
  if (title.includes("Download Series")) {
    const match = title.match(/Download Series,? Vol\.? (\d+)/i);
    if (match) {
      title = `Download Series Volume ${match[1]}`;
    }
  }

  // Road Trips
  // Current: "Road Trips: Vol 2, No 2: Feb 14, 1968, Carousel"
  // Desired: "Road Trips Volume 2.2: Carousel, 2/14/68"
  if (title.includes("Road Trips")) {
    const match = title.match(/Road Trips:? Vol (\d+), No\.? (\d+)/i);
    if (match) {
      // Keep the rest of the string but standardize the prefix
      const suffix = title.split(/No\.? \d+:?/i)[1]?.trim() || "";
      title = `Road Trips Volume ${match[1]}.${match[2]}${suffix ? ': ' + suffix : ''}`;
    }
  }

  return { ...entry, title };
}

const standardized = rawData.map(standardize);

fs.writeFileSync(RELEASES_PATH, JSON.stringify(standardized, null, 2));
console.log(`Standardized titles for collections.`);
