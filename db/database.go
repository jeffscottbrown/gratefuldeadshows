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

func init() {

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

func GetShowsAtVenue(venue string, city string) []Show {
	var shows []Show
	db.Where("venue = ? AND city = ?", venue, city).Order("date asc").Find(&shows)
	return shows
}

func GetShow(id int) Show {
	var show Show
	db.Preload("Sets.Songs").First(&show, id)
	return show
}

func GetShowsInState(state string) []Show {
	var shows []Show
	db.Where("state = ?", state).Order("date asc").Find(&shows)
	return shows
}

func GetShowsInCity(city string) []Show {
	var shows []Show
	db.Where("city = ?", city).Order("date asc").Find(&shows)
	return shows
}

func GetShowsInYear(year string) []Show {
	var shows []Show
	db.Where("EXTRACT(YEAR FROM date) = ?", year).Order("date asc").Find(&shows)
	return shows
}

func GetSongs(max int, offset int) []Song {
	var songs []Song
	db.Order("title").Limit(max).Offset(offset).Find(&songs)
	return songs
}

func GetVenues(max int, offset int) []struct {
	City  string
	State string
	Venue string
} {
	var venues []struct {
		City  string
		State string
		Venue string
	}
	db.Model(&Show{}).Distinct("city", "state", "venue").Order("venue").Limit(max).Offset(offset).Find(&venues)
	return venues
}

func GetShowsWithSong(songTitle string) []Show {
	var shows []Show
	db.Joins("JOIN show_sets ON shows.id = show_sets.show_id").
		Joins("JOIN set_songs ON show_sets.set_id = set_songs.set_id").
		Joins("JOIN songs ON set_songs.song_id = songs.id").
		Where("songs.title = ?", songTitle).Order("date asc").
		Find(&shows)
	return shows
}

func PrintStatistics() {
	var count int64

	db.Model(&Show{}).Count(&count)
	slog.Info("Shows", slog.Int64("count", count))

	db.Model(&Set{}).Count(&count)
	slog.Info("Sets", slog.Int64("count", count))

	db.Model(&Song{}).Count(&count)
	slog.Info("Songs", slog.Int64("count", count))

	db.Model(&Show{}).Distinct("venue").Count(&count)
	slog.Info("Venues", slog.Int64("count", count))
}
