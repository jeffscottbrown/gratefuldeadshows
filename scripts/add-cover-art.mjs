import fs from 'fs';
import path from 'path';

const RELEASES_PATH = path.join(process.cwd(), 'data', 'releases.json');
const rawData = JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'));

function getImageUrl(discUrl) {
  if (!discUrl || !discUrl.includes('deaddisc.com')) return null;

  // Example: https://www.deaddisc.com/disc/Dicks_Picks_1.htm
  // Image: http://www.deaddisc.com/covers/Dicks_Picks_1.jpg

  const match = discUrl.match(/\/disc\/(.+)\.htm/);
  if (match) {
    const slug = match[1];
    return `http://www.deaddisc.com/covers/${slug}.jpg`;
  }

  return null;
}

const updated = rawData.map(entry => {
  const imageUrl = getImageUrl(entry.discUrl);
  if (imageUrl) {
    return { ...entry, imageUrl };
  }
  return entry;
});

fs.writeFileSync(RELEASES_PATH, JSON.stringify(updated, null, 2));
console.log(`Added cover art URLs to ${updated.length} releases.`);
