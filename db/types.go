package db

import "time"

type Song struct {
	ID    uint `gorm:"primarykey"`
	Title string
}

type SongPerformance struct {
	ID         uint `gorm:"primarykey"`
	SetID      uint
	OrderInSet int
	SongID     uint
	Song       Song `gorm:"foreignKey:SongID"`
}

type Set struct {
	ID               uint `gorm:"primarykey"`
	ShowID           uint
	SetNumber        int
	SongPerformances []SongPerformance `gorm:"foreignKey:SetID"`
}

type Show struct {
	ID      uint      `gorm:"primarykey"`
	Date    time.Time `gorm:"type:date"`
	Venue   string
	City    string
	State   string
	Country string
	Sets    []Set `gorm:"foreignKey:ShowID"`
}

type GratefulDeadHistory struct {
	NumberOfShows            int
	NumberOfSets             int
	NumberOfDistinctSongs    int
	NumberOfSongPerformances int
	NumberOfVenues           int
	NumberOfCities           int
	NumberOfCountries        int
}
