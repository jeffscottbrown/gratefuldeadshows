package db

import (
	_ "embed"
	"fmt"
	"os"
	"strings"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

var History GratefulDeadHistory

//go:embed gratefuldata.db
var gratefuldataDb []byte

func init() {
	initializeDatabase()
	preloadData()
}

func initializeDatabase() {
	tempFile, err := os.CreateTemp("", "gratefuldata-*.db")
	if err != nil {
		fmt.Printf("Failed to create temp file: %v\n", err)
		panic("failed to create temp file")
	}

	_, err = tempFile.Write(gratefuldataDb)
	if err != nil {
		fmt.Printf("Failed to write to temp file: %v\n", err)
		panic("failed to write to temp file")
	}

	tempFilePath := tempFile.Name()

	db, err = gorm.Open(sqlite.Open(tempFilePath), &gorm.Config{})
	if err != nil {
		fmt.Printf("Failed to connect database: %v\n", err)
		panic("failed to connect database")
	}
}

func preloadData() {
	var count int64

	db.Model(&Show{}).
		Select("city, state, mind, COUNT(*)").
		Group("city, state, venue").
		Count(&count)

	History.NumberOfVenues = int(count)

	db.Model(&Show{}).Distinct("city").Count(&count)
	History.NumberOfCities = int(count)

	db.Model(&Show{}).Distinct("country").Count(&count)
	History.NumberOfCountries = int(count)

	db.Model(&Show{}).Count(&count)
	History.NumberOfShows = int(count)

	db.Model(&Set{}).Count(&count)
	History.NumberOfSets = int(count)

	db.Model(&Song{}).Count(&count)
	History.NumberOfDistinctSongs = int(count)

	db.Model(&SongPerformance{}).Count(&count)
	History.NumberOfSongPerformances = int(count)
}

func GetShowsAtVenue(venue string, city string, max int, offset int, fields ...string) struct {
	Shows      []Show
	TotalCount int
} {

	var shows []Show
	db.Where("venue = ? AND city = ?", venue, city).Limit(max).Offset(offset).Order("date asc").Find(&shows)
	var totalCount int64
	db.Model(&Show{}).Where("venue = ? AND city = ?", venue, city).Count(&totalCount)
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
	db.Where("country = ?", country).Limit(max).Offset(offset).Order("date asc").Find(&shows)

	var totalCount int64
	db.Model(&Show{}).Where("country = ?", country).Count(&totalCount)
	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func GetShowByDate(year string, month string, day string) (*Show, error) {
	month = fmt.Sprintf("%02s", month)
	day = fmt.Sprintf("%02s", day)
	dateStr := fmt.Sprintf("%s-%s-%s", year, month, day)

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, err
	}

	// Query by date
	var show Show

	result := db.Preload("Sets.SongPerformances.Song").Where("date = ?", date).First(&show)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, result.Error
		}
		return nil, result.Error
	}
	return &show, nil

}
func GetShowsInState(state string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	db.Where("state = ?", state).Limit(max).Offset(offset).Order("date asc").Find(&shows)
	var totalCount int64
	db.Model(&Show{}).Where("state = ?", state).Count(&totalCount)
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
	db.Where("city = ? AND state = ?", city, state).Limit(max).Offset(offset).Order("date asc").Find(&shows)
	var totalCount int64
	db.Model(&Show{}).Where("city = ? AND state = ?", city, state).Count(&totalCount)
	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func GetShowsInYear(year string) []Show {
	var shows []Show
	db.Where("strftime('%Y', date) = ?", year).Order("date asc").Find(&shows)
	return shows
}

func SongSearch(query string) []struct {
	Title         string
	ID            uint
	NumberOfShows int
} {
	var songs []struct {
		Title         string
		ID            uint
		NumberOfShows int
	}

	db.Model(&Song{}).
		Select("songs.title, songs.id, COUNT(DISTINCT shows.id) as number_of_shows").
		Joins("JOIN song_performances ON song_performances.song_id = songs.id").
		Joins("JOIN sets ON sets.id = song_performances.set_id").
		Joins("JOIN shows ON shows.id = sets.show_id").
		Where("LOWER(songs.title) LIKE ?", "%"+strings.ToLower(query)+"%").
		Group("songs.id").
		Order("songs.title").
		Scan(&songs)

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

	db.Model(&Song{}).
		Select("songs.title, songs.id, COUNT(DISTINCT shows.id) as number_of_shows").
		Joins("JOIN song_performances ON song_performances.song_id = songs.id").
		Joins("JOIN sets ON sets.id = song_performances.set_id").
		Joins("JOIN shows ON shows.id = sets.show_id").
		Group("songs.id").
		Order("songs.title").
		Limit(max).
		Offset(offset).
		Scan(&songs)

	var totalCount int64
	db.Model(&Song{}).Count(&totalCount)

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
	db.Model(&Show{}).
		Select("city, state, venue, COUNT(*) as number_of_shows").
		Group("city, state, venue").
		Order("venue").
		Limit(max).
		Offset(offset).
		Scan(&venues)
	var totalCount int64
	db.Model(&Show{}).
		Select("city, state, venue, COUNT(*)").
		Group("city, state, venue").
		Count(&totalCount)

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

func GetShowsWithSong(songTitle string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
	SongTitle  string
} {
	var shows []Show

	db.Joins("JOIN sets ON sets.show_id = shows.id").
		Joins("JOIN song_performances ON song_performances.set_id = sets.id").
		Joins("JOIN songs ON songs.id = song_performances.song_id").
		Where("LOWER(songs.title) = ?", strings.ToLower(songTitle)).
		Limit(max).
		Offset(offset).
		Order("date asc").
		Preload("Sets.SongPerformances.Song").
		Find(&shows)

	var totalCount int64

	db.Model(&Show{}).
		Joins("JOIN sets ON sets.show_id = shows.id").
		Joins("JOIN song_performances ON song_performances.set_id = sets.id").
		Joins("JOIN songs ON songs.id = song_performances.song_id").
		Where("LOWER(songs.title) = ?", strings.ToLower(songTitle)).
		Distinct("shows.date").
		Count(&totalCount)

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
