package db

import (
	"fmt"
	"log"
	"log/slog"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func LoadData() {

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	if dbUser == "" {
		log.Fatal("DB_USER environment variable is not set")
	}
	if dbPassword == "" {
		log.Fatal("DB_PASSWORD environment variable is not set")
	}
	if dbName == "" {
		log.Fatal("DB_NAME environment variable is not set")
	}
	if dbHost == "" {
		log.Fatal("DB_HOST environment variable is not set")
	}

	if dbPassword == "" || dbName == "" || dbHost == "" {
		log.Fatal("One or more environment variables are not set")
	}

	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s sslmode=disable", dbUser, dbPassword, dbName, dbHost)

	var err error

	for i := 0; i < 3; i++ {
		db, err = gorm.Open(postgres.Open(connStr), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database. Retrying in 3 seconds... (%d/3)", i+1)
		time.Sleep(3 * time.Second)
	}
	if err != nil {
		log.Fatal(err)
	}

}

func PrintStatistics() {
	var count int64

	db.Model(&Show{}).Distinct("venue").Scan(&count)
	slog.Info("Venue", slog.Int64("count", count))

	db.Model(&Show{}).Count(&count)
	slog.Info("Show", slog.Int64("count", count))

	db.Model(&Set{}).Count(&count)
	slog.Info("Set", slog.Int64("count", count))

	db.Model(&Song{}).Count(&count)
	slog.Info("Song", slog.Int64("count", count))

	db.Model(&SongPerformance{}).Count(&count)
	slog.Info("Song Performance", slog.Int64("count", count))
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
	db.Where("EXTRACT(YEAR FROM date) = ?", year).Limit(max).Offset(offset).Order("date asc").Find(&shows)
	var totalCount int64
	db.Model(&Show{}).Where("EXTRACT(YEAR FROM date) = ?", year).Count(&totalCount)
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
	db.Where("title ILIKE ?", "%"+query+"%").Find(&songs)
	return songs
}

func GetSongs(max int, offset int) struct {
	Songs []struct {
		Title string
	}
	TotalCount int
} {
	var songs []struct {
		Title string
	}
	db.Model(&Song{}).Distinct("title").Order("title").Limit(max).Offset(offset).Find(&songs)
	var totalCount int64
	db.Model(&Song{}).Select("COUNT(DISTINCT(title))").Scan(&totalCount)
	return struct {
		Songs []struct {
			Title string
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
	db.Model(&Show{}).Distinct("city", "state", "venue").Order("venue").Limit(max).Offset(offset).Find(&venues)
	var totalCount int64
	db.Model(&Show{}).Select("COUNT(DISTINCT(city, state, venue))").Scan(&totalCount)
	fmt.Printf("Total count: %d\n", totalCount)
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

func GetShowsWithSong(songTitle string, max int, offset int) struct {
	Shows      []Show
	TotalCount int
} {
	var shows []Show

	db.Joins("JOIN sets ON sets.show_id = shows.id").
		Joins("JOIN song_performances ON song_performances.set_id = sets.id").
		Joins("JOIN songs ON songs.id = song_performances.song_id").
		Where("songs.title = ?", songTitle).
		Limit(max).
		Offset(offset).
		Preload("Sets.SongPerformances.Song").
		Find(&shows)

	var totalCount int64
	db.Model(&Show{}).
		Joins("JOIN sets ON sets.show_id = shows.id").
		Joins("JOIN song_performances ON song_performances.set_id = sets.id").
		Joins("JOIN songs ON songs.id = song_performances.song_id").
		Where("songs.title = ?", songTitle).
		Count(&totalCount)

	return struct {
		Shows      []Show
		TotalCount int
	}{
		Shows:      shows,
		TotalCount: int(totalCount),
	}
}
