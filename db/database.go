package db

import (
	"fmt"
	"strings"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

var History GratefulDeadHistory

func init() {

	var err error
	db, err = gorm.Open(sqlite.Open("./db/gratefuldata.db"), &gorm.Config{})
	if err != nil {
		fmt.Printf("Failed to connect database: %v\n", err)
		panic("failed to connect database")
	}

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

func GetShow(id int) Show {
	var show Show
	db.Preload("Sets.SongPerformances.Song").First(&show, id)
	return show
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

func GetShowsInCity(city string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show
	db.Where("city = ?", city).Limit(max).Offset(offset).Order("date asc").Find(&shows)
	var totalCount int64
	db.Model(&Show{}).Where("city = ?", city).Count(&totalCount)
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
	db.Where("strftime('%Y', date) = ?", year).Limit(max).Offset(offset).Order("date asc").Find(&shows)
	var totalCount int64
	db.Model(&Show{}).Where("strftime('%Y', date) = ?", year).Count(&totalCount)
	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}

func SongSearch(query string) []Song {
	var songs []Song
	db.Where("LOWER(title) LIKE ?", "%"+strings.ToLower(query)+"%").Find(&songs)
	return songs
}

func GetSongs(max int, offset int) struct {
	Songs []struct {
		Title string
		ID    uint
	}
	TotalCount int
} {
	var songs []struct {
		Title string
		ID    uint
	}
	db.Model(&Song{}).Select("title, id").Order("title").Limit(max).Offset(offset).Find(&songs)
	var totalCount int64
	db.Model(&Song{}).Count(&totalCount)
	return struct {
		Songs []struct {
			Title string
			ID    uint
		}
		TotalCount int
	}{
		Songs:      songs,
		TotalCount: int(totalCount),
	}
}

func GetVenues(max int, offset int) struct {
	Venues []struct {
		City  string
		State string
		Venue string
	}
	TotalCount int
} {
	var venues []struct {
		City  string
		State string
		Venue string
	}
	db.Model(&Show{}).Select("city, state, venue").Distinct("city", "state", "venue").Order("venue").Limit(max).Offset(offset).Find(&venues)
	var totalCount int64
	db.Model(&Show{}).
		Select("city, state, venue, COUNT(*)").
		Group("city, state, venue").
		Count(&totalCount)

	return struct {
		Venues []struct {
			City  string
			State string
			Venue string
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

	db.Joins("JOIN sets ON sets.show_id = shows.id").
		Joins("JOIN song_performances ON song_performances.set_id = sets.id").
		Joins("JOIN songs ON songs.id = song_performances.song_id").
		Where("songs.id = ?", songId).
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
		Where("songs.id = ?", songId).
		Count(&totalCount)

	var song Song
	db.First(&song, songId)

	return struct {
		Shows      []Show
		TotalCount int
		SongTitle  string
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
		SongTitle:  song.Title,
	}
}
