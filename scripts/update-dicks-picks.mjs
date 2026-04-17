import fs from 'fs';
import path from 'path';

const RELEASES_PATH = path.join(process.cwd(), 'data', 'releases.json');
const rawData = JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'));

const dicksPicksInfo = {
  1: "Curtis Hixon Convention Hall, Tampa, FL",
  2: "Ohio Theatre, Columbus, OH",
  3: "Sportatorium, Pembroke Pines, FL",
  4: "Fillmore East, New York, NY",
  5: "Oakland Auditorium Arena, Oakland, CA",
  6: "Hartford Civic Center, Hartford, CT",
  7: "Alexandra Palace, London, England",
  8: "Harpur College, Binghamton, NY",
  9: "Madison Square Garden, New York, NY",
  10: "Winterland Arena, San Francisco, CA",
  11: "Stanley Theatre, Jersey City, NJ",
  12: "Providence, RI & Boston, MA",
  13: "Nassau Coliseum, Uniondale, NY",
  14: "Boston Music Hall, Boston, MA",
  15: "Raceway Park, Englishtown, NJ",
  16: "Fillmore Auditorium, San Francisco, CA",
  17: "Boston Garden, Boston, MA",
  18: "Madison, WI & Cedar Falls, IA",
  19: "Fairgrounds Arena, Oklahoma City, OK",
  20: "Landover, MD & Syracuse, NY",
  21: "Richmond Coliseum, Richmond, VA",
  22: "Kings Beach Bowl, Lake Tahoe, CA",
  23: "Baltimore Civic Center, Baltimore, MD",
  24: "Cow Palace, Daly City, CA",
  25: "New Haven, CT & Springfield, MA",
  26: "Chicago, IL & Minneapolis, MN",
  27: "Oakland Coliseum Arena, Oakland, CA",
  28: "Lincoln, NE & Salt Lake City, UT",
  29: "Atlanta, GA & Lakeland, FL",
  30: "Academy of Music, New York, NY",
  31: "Philadelphia, PA & Jersey City, NJ",
  32: "Alpine Valley Music Theatre, East Troy, WI",
  33: "Oakland Coliseum Stadium, Oakland, CA",
  34: "Community War Memorial, Rochester, NY",
  35: "San Diego, Chicago, Hollywood",
  36: "The Spectrum, Philadelphia, PA"
};

const updated = rawData.map(entry => {
  if (entry.title.includes("Dick's Picks")) {
    const match = entry.title.match(/Dick's Picks Volume (\d+)/i) || entry.title.match(/Dick's Picks, Vol\. (\d+)/i);
    if (match) {
      const vol = parseInt(match[1], 10);
      const info = dicksPicksInfo[vol];
      if (info) {
        return {
          ...entry,
          title: `Dick's Picks Volume ${vol}: ${info}`
        };
      }
    }
  }
  return entry;
});

fs.writeFileSync(RELEASES_PATH, JSON.stringify(updated, null, 2));
console.log("Updated Dick's Picks titles with venue/city info.");
