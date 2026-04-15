import Database from "better-sqlite3";
import path from "path";

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "db", "gratefuldata.db");
    _db = new Database(dbPath, { readonly: true });
  }
  return _db;
}

export interface Show {
  id: number;
  date: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  year: string;
}

export interface Song {
  id: number;
  title: string;
}

export interface SetWithSongs {
  set_number: number;
  songs: { song_id: number; title: string; order_in_set: number }[];
}

export interface ShowDetail extends Show {
  sets: SetWithSongs[];
}

export interface Stats {
  numberOfShows: number;
  numberOfDistinctSongs: number;
  numberOfSongPerformances: number;
  numberOfVenues: number;
  numberOfCities: number;
  numberOfCountries: number;
}

// ---------- Years ----------

export function getYears(): { year: string; count: number }[] {
  return getDb()
    .prepare(
      `SELECT strftime('%Y', date) AS year, COUNT(*) AS count
       FROM shows
       GROUP BY year
       ORDER BY year DESC`,
    )
    .all() as { year: string; count: number }[];
}

export function getShowsByYear(year: string): Show[] {
  return getDb()
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows
       WHERE strftime('%Y', date) = ?
       ORDER BY date`,
    )
    .all(year) as Show[];
}

// ---------- Cities ----------

export function getCities(): {
  city: string;
  country: string;
  count: number;
}[] {
  return getDb()
    .prepare(
      `SELECT city, country, COUNT(*) AS count
       FROM shows
       GROUP BY city, country
       ORDER BY city COLLATE NOCASE`,
    )
    .all() as { city: string; country: string; count: number }[];
}

export function getShowsByCity(city: string): Show[] {
  return getDb()
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows
       WHERE lower(city) = lower(?)
       ORDER BY date`,
    )
    .all(city) as Show[];
}

// ---------- States ----------

export function getStates(): {
  state: string;
  country: string;
  count: number;
}[] {
  return getDb()
    .prepare(
      `SELECT state, country, COUNT(*) AS count
       FROM shows
       WHERE state IS NOT NULL AND state != ''
       GROUP BY state, country
       ORDER BY state COLLATE NOCASE`,
    )
    .all() as { state: string; country: string; count: number }[];
}

export function getShowsByState(state: string): Show[] {
  return getDb()
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows
       WHERE lower(state) = lower(?)
       ORDER BY date`,
    )
    .all(state) as Show[];
}

// ---------- Countries ----------

export function getCountries(): { country: string; count: number }[] {
  return getDb()
    .prepare(
      `SELECT country, COUNT(*) AS count
       FROM shows
       GROUP BY country
       ORDER BY count DESC`,
    )
    .all() as { country: string; count: number }[];
}

export function getShowsByCountry(country: string): Show[] {
  return getDb()
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows
       WHERE lower(country) = lower(?)
       ORDER BY date`,
    )
    .all(country) as Show[];
}

// ---------- Venues ----------

export function getShowsByVenue(venue: string): Show[] {
  return getDb()
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows
       WHERE lower(venue) = lower(?)
       ORDER BY date`,
    )
    .all(venue) as Show[];
}

// ---------- Songs ----------

export function getSongs(): { id: number; title: string; count: number }[] {
  return getDb()
    .prepare(
      `SELECT sg.id, sg.title, COUNT(sp.id) AS count
       FROM songs sg
       LEFT JOIN song_performances sp ON sp.song_id = sg.id
       GROUP BY sg.id
       ORDER BY sg.title COLLATE NOCASE`,
    )
    .all() as { id: number; title: string; count: number }[];
}

export function getSongById(id: number): Song | null {
  return (
    (getDb().prepare(`SELECT id, title FROM songs WHERE id = ?`).get(id) as
      | Song
      | undefined) ?? null
  );
}

export function getShowsBySong(songId: number): Show[] {
  return getDb()
    .prepare(
      `SELECT DISTINCT s.id, s.date, s.venue, s.city, s.state, s.country,
              strftime('%Y', s.date) AS year
       FROM shows s
       JOIN sets st ON st.show_id = s.id
       JOIN song_performances sp ON sp.set_id = st.id
       WHERE sp.song_id = ?
       ORDER BY s.date`,
    )
    .all(songId) as Show[];
}

// ---------- Birthday ----------

export function getShowsByBirthday(month: number, day: number): Show[] {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return getDb()
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows
       WHERE strftime('%m-%d', date) = ?
       ORDER BY date`,
    )
    .all(`${m}-${d}`) as Show[];
}

export function getShowByDate(date: string): Show | null {
  return (
    (getDb()
      .prepare(
        `SELECT id, date, venue, city, state, country,
                strftime('%Y', date) AS year
         FROM shows
         WHERE date LIKE ?`,
      )
      .get(`${date}%`) as Show | undefined) ?? null
  );
}

// ---------- Show detail ----------

export function getShow(id: number): ShowDetail | null {
  const db = getDb();
  const show = db
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows WHERE id = ?`,
    )
    .get(id) as Show | undefined;

  if (!show) return null;

  const rows = db
    .prepare(
      `SELECT st.set_number, sp.order_in_set, sg.id AS song_id, sg.title
       FROM sets st
       JOIN song_performances sp ON sp.set_id = st.id
       JOIN songs sg ON sg.id = sp.song_id
       WHERE st.show_id = ?
       ORDER BY st.set_number, sp.order_in_set`,
    )
    .all(id) as {
    set_number: number;
    order_in_set: number;
    song_id: number;
    title: string;
  }[];

  const setsMap = new Map<number, SetWithSongs>();
  for (const row of rows) {
    if (!setsMap.has(row.set_number)) {
      setsMap.set(row.set_number, { set_number: row.set_number, songs: [] });
    }
    setsMap.get(row.set_number)!.songs.push({
      song_id: row.song_id,
      title: row.title,
      order_in_set: row.order_in_set,
    });
  }

  return { ...show, sets: Array.from(setsMap.values()) };
}

// ---------- Search ----------

export function searchShows(filters: {
  year?: string;
  country?: string;
  city?: string;
}): Show[] {
  const conditions: string[] = [];
  const params: string[] = [];

  if (filters.year) {
    conditions.push("strftime('%Y', date) = ?");
    params.push(filters.year);
  }
  if (filters.country) {
    conditions.push("lower(country) = lower(?)");
    params.push(filters.country);
  }
  if (filters.city) {
    conditions.push("lower(city) = lower(?)");
    params.push(filters.city);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return getDb()
    .prepare(
      `SELECT id, date, venue, city, state, country,
              strftime('%Y', date) AS year
       FROM shows ${where}
       ORDER BY date`,
    )
    .all(...params) as Show[];
}

// ---------- Stats ----------

export function getStats(): Stats {
  const db = getDb();
  const shows = (
    db.prepare(`SELECT COUNT(*) AS n FROM shows`).get() as { n: number }
  ).n;
  const songs = (
    db.prepare(`SELECT COUNT(*) AS n FROM songs`).get() as { n: number }
  ).n;
  const performances = (
    db.prepare(`SELECT COUNT(*) AS n FROM song_performances`).get() as {
      n: number;
    }
  ).n;
  const venues = (
    db.prepare(`SELECT COUNT(DISTINCT venue) AS n FROM shows`).get() as {
      n: number;
    }
  ).n;
  const cities = (
    db.prepare(`SELECT COUNT(DISTINCT city) AS n FROM shows`).get() as {
      n: number;
    }
  ).n;
  const countries = (
    db.prepare(`SELECT COUNT(DISTINCT country) AS n FROM shows`).get() as {
      n: number;
    }
  ).n;

  return {
    numberOfShows: shows,
    numberOfDistinctSongs: songs,
    numberOfSongPerformances: performances,
    numberOfVenues: venues,
    numberOfCities: cities,
    numberOfCountries: countries,
  };
}
