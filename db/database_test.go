package db

import (
	"testing"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() *gorm.DB {
	// Create an in-memory SQLite database for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}

	// Migrate the schema
	db.AutoMigrate(&Show{}, &Set{}, &Song{}, &SongPerformance{})

	// Seed test data
	song := Song{Title: "Scarlet Begonias"}
	db.Create(&song)

	date, _ := time.Parse("2006-01-02", "1974-05-19")
	show := Show{Date: date}
	db.Create(&show)

	set := Set{ShowID: show.ID}
	db.Create(&set)

	songPerformance := SongPerformance{SetID: set.ID, SongID: song.ID}
	db.Create(&songPerformance)

	return db
}

func TestGetShowsWithSong(t *testing.T) {
	// Setup test database
	testDB := setupTestDB()
	db = testDB // Assign the test database to the global `db` variable

	// Test case: Valid song title
	result := GetShowsWithSong("Scarlet Begonias", 10, 0)
	if len(result.Shows) != 1 {
		t.Errorf("expected 1 show, got %d", len(result.Shows))
	}
	if result.TotalCount != 1 {
		t.Errorf("expected total count to be 1, got %d", result.TotalCount)
	}
	if result.SongTitle != "Scarlet Begonias" {
		t.Errorf("expected song title to be 'Scarlet Begonias', got '%s'", result.SongTitle)
	}

	// Test case: Song title with different casing
	result = GetShowsWithSong("scarlet begonias", 10, 0)
	if len(result.Shows) != 1 {
		t.Errorf("expected 1 show, got %d", len(result.Shows))
	}

	// Test case: Non-existent song title
	result = GetShowsWithSong("Nonexistent Song", 10, 0)
	if len(result.Shows) != 0 {
		t.Errorf("expected 0 shows, got %d", len(result.Shows))
	}
	if result.TotalCount != 0 {
		t.Errorf("expected total count to be 0, got %d", result.TotalCount)
	}
}
