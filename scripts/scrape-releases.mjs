#!/usr/bin/env node
// Scrapes https://www.deaddisc.com/GDFD_Dead_By_Date.htm and writes data/releases.json
// Run with: node scripts/scrape-releases.mjs

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '..', 'data', 'releases.json');
const SOURCE_URL = 'https://www.deaddisc.com/GDFD_Dead_By_Date.htm';
const BASE_URL = 'https://www.deaddisc.com/';

const MONTHS = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function monthNum(str) {
  return MONTHS[str.toLowerCase().slice(0, 3)] ?? null;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// Returns { type: 'exact', dates: ['YYYY-MM-DD', ...] }
//      or { type: 'range', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
//      or null if unparseable
function parseDate(raw) {
  const text = raw.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim();

  // Skip year headers, empty cells, approximate dates
  if (!text || /^\d{4}$/.test(text) || /^(early|late|mid|unknown|various|spring|summer|fall|winter|circa)/i.test(text)) {
    return null;
  }

  // "Nov 3, 1965" or "November 3, 1965"
  const single = text.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (single) {
    const m = monthNum(single[1]);
    if (!m) return null;
    return { type: 'exact', dates: [`${single[3]}-${m}-${pad(single[2])}`] };
  }

  // "April 7-9, 1972" (same month range)
  const sameMonth = text.match(/^([A-Za-z]+)\s+(\d{1,2})-(\d{1,2}),?\s+(\d{4})$/);
  if (sameMonth) {
    const m = monthNum(sameMonth[1]);
    if (!m) return null;
    const year = sameMonth[4];
    return {
      type: 'range',
      startDate: `${year}-${m}-${pad(sameMonth[2])}`,
      endDate: `${year}-${m}-${pad(sameMonth[3])}`,
    };
  }

  // "April 7-May 26, 1972" (different month, same year)
  const diffMonth = text.match(/^([A-Za-z]+)\s+(\d{1,2})-([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (diffMonth) {
    const m1 = monthNum(diffMonth[1]);
    const m2 = monthNum(diffMonth[3]);
    if (!m1 || !m2) return null;
    const year = diffMonth[5];
    return {
      type: 'range',
      startDate: `${year}-${m1}-${pad(diffMonth[2])}`,
      endDate: `${year}-${m2}-${pad(diffMonth[4])}`,
    };
  }

  // "Nov 15, 1969-Jan 2, 1970" (different month AND year)
  const diffYear = text.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})-([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (diffYear) {
    const m1 = monthNum(diffYear[1]);
    const m2 = monthNum(diffYear[4]);
    if (!m1 || !m2) return null;
    return {
      type: 'range',
      startDate: `${diffYear[3]}-${m1}-${pad(diffYear[2])}`,
      endDate: `${diffYear[6]}-${m2}-${pad(diffYear[5])}`,
    };
  }

  return null;
}

function cleanTitle(rawTitle) {
  // Strip ", Grateful Dead, YYYY" or ", Grateful Dead Records, YYYY" suffix
  return rawTitle
    .replace(/,\s*Grateful Dead(?:[^,]*)?,\s*\d{4}.*$/i, '')
    .trim();
}

function extractRows(html) {
  const releases = [];
  // Find all <tr> rows
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRe.exec(html)) !== null) {
    const row = rowMatch[1];
    // Extract <td> cells
    const cells = [];
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRe.exec(row)) !== null) {
      cells.push(cellMatch[1]);
    }
    if (cells.length < 3) continue;

    const parsedDate = parseDate(cells[0]);
    if (!parsedDate) continue;

    // Extract link from 3rd cell
    const linkMatch = cells[2].match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const href = linkMatch[1];
    const rawTitle = linkMatch[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
    if (!rawTitle) continue;

    // Skip video releases
    if (href.includes('/vi/')) continue;

    const discUrl = href.startsWith('http') ? href : BASE_URL + href;
    const title = cleanTitle(rawTitle);

    releases.push({ ...parsedDate, title, discUrl });
  }

  return releases;
}

async function main() {
  console.log(`Fetching ${SOURCE_URL}...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  console.log('Parsing...');
  const releases = extractRows(html);
  console.log(`Found ${releases.length} releases`);

  mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(releases, null, 2));
  console.log(`Written to ${OUTPUT}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
