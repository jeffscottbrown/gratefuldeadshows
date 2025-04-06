package db

import (
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"strings"
)

var sqlDb *sql.DB

var History GratefulDeadHistory

func init() {

	var err error
	sqlDb, err = sql.Open("sqlite3", "./db/gratefuldata.db")
	if err != nil {
		fmt.Printf("Failed to connect database: %v\n", err)
		panic("failed to connect database")
	}

	var count int64

	sqlDb.QueryRow(`
		SELECT COUNT(DISTINCT city || state || venue) 
		FROM shows`).Scan(&count)
	History.NumberOfVenues = int(count)

	sqlDb.QueryRow(`
		SELECT COUNT(DISTINCT city) 
		FROM shows`).Scan(&count)
	History.NumberOfCities = int(count)

	sqlDb.QueryRow(`
		SELECT COUNT(DISTINCT country) 
		FROM shows`).Scan(&count)
	History.NumberOfCountries = int(count)

	sqlDb.QueryRow(`
		SELECT COUNT(*) 
		FROM shows`).Scan(&count)
	History.NumberOfShows = int(count)

	sqlDb.QueryRow(`
		SELECT COUNT(*) 
		FROM sets`).Scan(&count)
	History.NumberOfSets = int(count)

	sqlDb.QueryRow(`
		SELECT COUNT(*) 
		FROM songs`).Scan(&count)
	History.NumberOfDistinctSongs = int(count)

	sqlDb.QueryRow(`
		SELECT COUNT(*) 
		FROM song_performances`).Scan(&count)
	History.NumberOfSongPerformances = int(count)
}

func GetShowsAtVenue(venue string, city string, max int, offset int, fields ...string) struct {
	Shows      []Show
	TotalCount int
} {

	var shows []Show

	query := `
		SELECT id, date, venue, city, state, country 
		FROM shows 
		WHERE venue = ? AND city = ? 
		ORDER BY date ASC 
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, venue, city, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var show Show
		if err := rows.Scan(&show.ID, &show.Date, &show.Venue, &show.City, &show.State, &show.Country); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		shows = append(shows, show)
	}

	var totalCount int64
	query = `
		SELECT COUNT(*) 
		FROM shows 
		WHERE venue = ? AND city = ?`
	sqlDb.QueryRow(query, venue, city).Scan(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func GetShowsInCountry(country string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show

	query := `
		SELECT id, date, venue, city, state, country 
		FROM shows 
		WHERE country = ? 
		ORDER BY date ASC 
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, country, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var show Show
		if err := rows.Scan(&show.ID, &show.Date, &show.Venue, &show.City, &show.State, &show.Country); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		shows = append(shows, show)
	}

	var totalCount int64
	query = `
		SELECT COUNT(*) 
		FROM shows 
		WHERE country = ?`
	sqlDb.QueryRow(query, country).Scan(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func GetShow(showID int) Show {
	var show Show

	// 1. Get the Show
	err := sqlDb.QueryRow(`
        SELECT id, date, venue, city, state, country 
        FROM shows 
        WHERE id = ?`, showID).
		Scan(&show.ID, &show.Date, &show.Venue, &show.City, &show.State, &show.Country)
	if err != nil {
		return Show{} // Return empty show if not found or error
	}

	// 2. Get the Sets
	sets := make([]Set, 0)
	setIDs := make([]interface{}, 0)

	rows, err := sqlDb.Query(`
        SELECT id, show_id, set_number 
        FROM sets 
        WHERE show_id = ?`, show.ID)
	if err != nil {
		return Show{}
	}
	defer rows.Close()

	for rows.Next() {
		var set Set
		if err := rows.Scan(&set.ID, &set.ShowID, &set.SetNumber); err != nil {
			return Show{}
		}
		sets = append(sets, set)
		setIDs = append(setIDs, set.ID)
	}

	if len(setIDs) == 0 {
		show.Sets = sets
		return show
	}

	// 3. Get SongPerformances
	placeholders := make([]string, len(setIDs))
	for i := range setIDs {
		placeholders[i] = "?"
	}
	query := fmt.Sprintf(`
        SELECT id, set_id, order_in_set, song_id 
        FROM song_performances 
        WHERE set_id IN (%s)`, strings.Join(placeholders, ","))

	rows, err = sqlDb.Query(query, setIDs...)
	if err != nil {
		return Show{}
	}
	defer rows.Close()

	performancesBySet := make(map[uint][]SongPerformance)
	songIDs := make(map[uint]struct{})

	for rows.Next() {
		var sp SongPerformance
		if err := rows.Scan(&sp.ID, &sp.SetID, &sp.OrderInSet, &sp.SongID); err != nil {
			return Show{}
		}
		performancesBySet[sp.SetID] = append(performancesBySet[sp.SetID], sp)
		songIDs[sp.SongID] = struct{}{}
	}

	// 4. Get Songs
	songs := make(map[uint]Song)
	if len(songIDs) > 0 {
		songIDList := make([]interface{}, 0, len(songIDs))
		songPlaceholders := make([]string, 0, len(songIDs))
		for id := range songIDs {
			songIDList = append(songIDList, id)
			songPlaceholders = append(songPlaceholders, "?")
		}

		query = fmt.Sprintf(`
            SELECT id, title 
            FROM songs 
            WHERE id IN (%s)`, strings.Join(songPlaceholders, ","))
		rows, err = sqlDb.Query(query, songIDList...)
		if err != nil {
			return Show{}
		}
		defer rows.Close()

		for rows.Next() {
			var s Song
			if err := rows.Scan(&s.ID, &s.Title); err != nil {
				return Show{}
			}
			songs[s.ID] = s
		}
	}

	// 5. Stitch it all together
	for i := range sets {
		set := &sets[i]
		performances := performancesBySet[set.ID]
		for j := range performances {
			if song, ok := songs[performances[j].SongID]; ok {
				performances[j].Song = song
			}
		}
		set.SongPerformances = performances
	}

	show.Sets = sets
	return show
}

func GetShowsInState(state string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show

	query := `
		SELECT id, date, venue, city, state, country 
		FROM shows 
		WHERE state = ? 
		ORDER BY date ASC 
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, state, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var show Show
		if err := rows.Scan(&show.ID, &show.Date, &show.Venue, &show.City, &show.State, &show.Country); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		shows = append(shows, show)
	}

	var totalCount int64

	query = `
		SELECT COUNT(*) 
		FROM shows 
		WHERE state = ?`
	sqlDb.QueryRow(query, state).Scan(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func GetShowsInCity(city string, state string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	query := `
		SELECT id, date, venue, city, state, country 
		FROM shows 
		WHERE city = ? AND state = ? 
		ORDER BY date ASC 
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, city, state, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var show Show
		if err := rows.Scan(&show.ID, &show.Date, &show.Venue, &show.City, &show.State, &show.Country); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		shows = append(shows, show)
	}

	var totalCount int64
	query = `
		SELECT COUNT(*) 
		FROM shows 
		WHERE city = ? AND state = ?`
	sqlDb.QueryRow(query, city, state).Scan(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func GetShowsInYear(year string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	query := `
		SELECT id, date, venue, city, state, country 
		FROM shows 
		WHERE strftime('%Y', date) = ? 
		ORDER BY date ASC 
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, year, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var show Show
		if err := rows.Scan(&show.ID, &show.Date, &show.Venue, &show.City, &show.State, &show.Country); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		shows = append(shows, show)
	}

	var totalCount int64
	query = `
		SELECT COUNT(*) 
		FROM shows 
		WHERE strftime('%Y', date) = ?`
	sqlDb.QueryRow(query, year).Scan(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func SongSearch(songTitleParam string) []struct {
	Title         string
	ID            uint
	NumberOfShows int
} {
	var songs []struct {
		Title         string
		ID            uint
		NumberOfShows int
	}

	query := `
		SELECT songs.title, songs.id, COUNT(DISTINCT shows.id) as number_of_shows
		FROM songs
		JOIN song_performances ON song_performances.song_id = songs.id
		JOIN sets ON sets.id = song_performances.set_id
		JOIN shows ON shows.id = sets.show_id
		WHERE songs.title LIKE ?
		GROUP BY songs.id
		ORDER BY songs.title`
	rows, err := sqlDb.Query(query, "%"+songTitleParam+"%")
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var song struct {
			Title         string
			ID            uint
			NumberOfShows int
		}
		if err := rows.Scan(&song.Title, &song.ID, &song.NumberOfShows); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		songs = append(songs, song)
	}

	return songs
}

func GetSongs(max int, offset int) struct {
	Songs []struct {
		Title         string
		ID            uint
		NumberOfShows int
	}
	TotalCount int
} {

	var songs []struct {
		Title         string
		ID            uint
		NumberOfShows int
	}
	query := `
		SELECT songs.title, songs.id, COUNT(DISTINCT shows.id) as number_of_shows
		FROM songs
		JOIN song_performances ON song_performances.song_id = songs.id
		JOIN sets ON sets.id = song_performances.set_id
		JOIN shows ON shows.id = sets.show_id
		GROUP BY songs.id
		ORDER BY songs.title
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var song struct {
			Title         string
			ID            uint
			NumberOfShows int
		}
		if err := rows.Scan(&song.Title, &song.ID, &song.NumberOfShows); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		songs = append(songs, song)
	}
	var totalCount int64

	query = `
		SELECT COUNT(DISTINCT songs.id)
		FROM songs
		JOIN song_performances ON song_performances.song_id = songs.id
		JOIN sets ON sets.id = song_performances.set_id
		JOIN shows ON shows.id = sets.show_id`
	sqlDb.QueryRow(query).Scan(&totalCount)

	return struct {
		Songs []struct {
			Title         string
			ID            uint
			NumberOfShows int
		}
		TotalCount int
	}{
		Songs:      songs,
		TotalCount: int(totalCount),
	}
}

func GetVenues(max int, offset int) struct {
	Venues []struct {
		City          string
		State         string
		Venue         string
		NumberOfShows int
	}
	TotalCount int
} {
	var venues []struct {
		City          string
		State         string
		Venue         string
		NumberOfShows int
	}

	query := `
		SELECT city, state, venue, COUNT(*) as number_of_shows
		FROM shows
		GROUP BY city, state, venue
		ORDER BY venue
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var venue struct {
			City          string
			State         string
			Venue         string
			NumberOfShows int
		}
		if err := rows.Scan(&venue.City, &venue.State, &venue.Venue, &venue.NumberOfShows); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		venues = append(venues, venue)
	}

	var totalCount int64
	query = `
		SELECT COUNT(DISTINCT city || state || venue)
		FROM shows`
	sqlDb.QueryRow(query).Scan(&totalCount)

	return struct {
		Venues []struct {
			City          string
			State         string
			Venue         string
			NumberOfShows int
		}
		TotalCount int
	}{
		Venues:     venues,
		TotalCount: int(totalCount),
	}
}

func GetShowsWithSong(songId int, max int, offset int) struct {
	Shows      []Show
	TotalCount int
	SongTitle  string
} {
	var shows []Show
	var songTitle string

	// Get the song title
	err := sqlDb.QueryRow(`
		SELECT title 
		FROM songs 
		WHERE id = ?`, songId).Scan(&songTitle)
	if err != nil {
		log.Fatalf("Failed to get song title: %v", err)
	}

	// Query for shows containing the song
	query := `
		SELECT DISTINCT shows.id, shows.date, shows.venue, shows.city, shows.state, shows.country
		FROM shows
		JOIN sets ON sets.show_id = shows.id
		JOIN song_performances ON song_performances.set_id = sets.id
		WHERE song_performances.song_id = ?
		ORDER BY shows.date ASC
		LIMIT ? OFFSET ?`
	rows, err := sqlDb.Query(query, songId, max, offset)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var show Show
		if err := rows.Scan(&show.ID, &show.Date, &show.Venue, &show.City, &show.State, &show.Country); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		shows = append(shows, GetShow(int(show.ID))) // Populate the full graph for each show
	}

	// Get the total count of shows containing the song
	var totalCount int64
	query = `
		SELECT COUNT(DISTINCT shows.id)
		FROM shows
		JOIN sets ON sets.show_id = shows.id
		JOIN song_performances ON song_performances.set_id = sets.id
		WHERE song_performances.song_id = ?`
	sqlDb.QueryRow(query, songId).Scan(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
		SongTitle  string
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
		SongTitle:  songTitle,
	}

}
