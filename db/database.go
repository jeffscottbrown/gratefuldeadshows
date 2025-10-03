package db

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

//go:embed gratefuldata.db
var gratefuldataDb []byte

type GratefulDeadDatabase struct {
	sqlDB   *gorm.DB
	history GratefulDeadHistory
}

func NewGratefulDeadDatabase() *GratefulDeadDatabase {
	gdd := &GratefulDeadDatabase{}
	gdd.initializeDatabase()
	gdd.preloadData()

	return gdd
}

func (gdd *GratefulDeadDatabase) GetHistory() GratefulDeadHistory {
	return gdd.history
}

func (gdd *GratefulDeadDatabase) GetShowsAtVenue(venue string, city string, limit int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	gdd.sqlDB.Where("venue = ? AND city = ?", venue, city).Limit(limit).Offset(offset).Order("date asc").Find(&shows)

	var totalCount int64
	gdd.sqlDB.Model(&Show{}).Where("venue = ? AND city = ?", venue, city).Count(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func (gdd *GratefulDeadDatabase) GetShowsInCountry(country string, limit int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	gdd.sqlDB.Where("country = ?", country).Limit(limit).Offset(offset).Order("date asc").Find(&shows)

	var totalCount int64
	gdd.sqlDB.Model(&Show{}).Where("country = ?", country).Count(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func (gdd *GratefulDeadDatabase) GetShowByDate(year string, month string, day string) (*Show, error) {
	month = fmt.Sprintf("%02s", month)
	day = fmt.Sprintf("%02s", day)
	dateStr := fmt.Sprintf("%s-%s-%s", year, month, day)

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, err
	}

	// Query by date
	var show Show

	result := gdd.sqlDB.Preload("Sets.SongPerformances.Song").Where("date = ?", date).First(&show)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, result.Error
		}

		return nil, result.Error
	}

	return &show, nil
}

func (gdd *GratefulDeadDatabase) GetShowsInState(state string, limit int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	gdd.sqlDB.Where("state = ?", state).Limit(limit).Offset(offset).Order("date asc").Find(&shows)

	var totalCount int64
	gdd.sqlDB.Model(&Show{}).Where("state = ?", state).Count(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func (gdd *GratefulDeadDatabase) GetShowsInCity(city string, state string, limit int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	gdd.sqlDB.Where("city = ? AND state = ?", city, state).Limit(limit).Offset(offset).Order("date asc").Find(&shows)

	var totalCount int64
	gdd.sqlDB.Model(&Show{}).Where("city = ? AND state = ?", city, state).Count(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func (gdd *GratefulDeadDatabase) GetShowsInYear(year string) []Show {
	var shows []Show
	gdd.sqlDB.Where("strftime('%Y', date) = ?", year).Order("date asc").Find(&shows)

	return shows
}

func (gdd *GratefulDeadDatabase) SongSearch(query string) []struct {
	Title         string
	ID            uint
	NumberOfShows int
} {
	var songs []struct {
		Title         string
		ID            uint
		NumberOfShows int
	}

	gdd.sqlDB.Model(&Song{}).
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

func (gdd *GratefulDeadDatabase) GetSongs(limit int, offset int) struct {
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

	gdd.sqlDB.Model(&Song{}).
		Select("songs.title, songs.id, COUNT(DISTINCT shows.id) as number_of_shows").
		Joins("JOIN song_performances ON song_performances.song_id = songs.id").
		Joins("JOIN sets ON sets.id = song_performances.set_id").
		Joins("JOIN shows ON shows.id = sets.show_id").
		Group("songs.id").
		Order("songs.title").
		Limit(limit).
		Offset(offset).
		Scan(&songs)

	var totalCount int64
	gdd.sqlDB.Model(&Song{}).Count(&totalCount)

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

func (gdd *GratefulDeadDatabase) GetVenues(limit int, offset int) struct {
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
	gdd.sqlDB.Model(&Show{}).
		Select("city, state, venue, COUNT(*) as number_of_shows").
		Group("city, state, venue").
		Order("venue").
		Limit(limit).
		Offset(offset).
		Scan(&venues)

	var totalCount int64
	gdd.sqlDB.Model(&Show{}).
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

func (gdd *GratefulDeadDatabase) GetShowsWithSong(songTitle string, limit int, offset int) struct {
	Shows      []Show
	TotalCount int
	SongTitle  string
} {
	var shows []Show

	gdd.sqlDB.Joins("JOIN sets ON sets.show_id = shows.id").
		Joins("JOIN song_performances ON song_performances.set_id = sets.id").
		Joins("JOIN songs ON songs.id = song_performances.song_id").
		Where("LOWER(songs.title) = ?", strings.ToLower(songTitle)).
		Limit(limit).
		Offset(offset).
		Order("date asc").
		Preload("Sets.SongPerformances.Song").
		Find(&shows)

	var totalCount int64

	gdd.sqlDB.Model(&Show{}).
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

func (gdd *GratefulDeadDatabase) preloadData() {
	var count int64

	gdd.sqlDB.Model(&Show{}).
		Select("city, state, mind, COUNT(*)").
		Group("city, state, venue").
		Count(&count)

	gdd.history.NumberOfVenues = int(count)

	gdd.sqlDB.Model(&Show{}).Distinct("city").Count(&count)
	gdd.history.NumberOfCities = int(count)

	gdd.sqlDB.Model(&Show{}).Distinct("country").Count(&count)
	gdd.history.NumberOfCountries = int(count)

	gdd.sqlDB.Model(&Show{}).Count(&count)
	gdd.history.NumberOfShows = int(count)

	gdd.sqlDB.Model(&Set{}).Count(&count)
	gdd.history.NumberOfSets = int(count)

	gdd.sqlDB.Model(&Song{}).Count(&count)
	gdd.history.NumberOfDistinctSongs = int(count)

	gdd.sqlDB.Model(&SongPerformance{}).Count(&count)
	gdd.history.NumberOfSongPerformances = int(count)
}

func (gdd *GratefulDeadDatabase) initializeDatabase() {
	tempFile, err := os.CreateTemp("", "gratefuldata-*.db")
	if err != nil {
		slog.ErrorContext(context.Background(), "Failed to create temp file", slog.Any("error", err))
		panic("failed to create temp file")
	}

	_, err = tempFile.Write(gratefuldataDb)
	if err != nil {
		slog.ErrorContext(context.Background(), "Failed to write to temp file", slog.Any("error", err))
		panic("failed to write to temp file")
	}

	tempFilePath := tempFile.Name()

	gdd.sqlDB, err = gorm.Open(sqlite.Open(tempFilePath), &gorm.Config{})
	if err != nil {
		slog.ErrorContext(context.Background(), "Failed to connect database", slog.Any("error", err))
		panic("failed to connect database")
	}
}
