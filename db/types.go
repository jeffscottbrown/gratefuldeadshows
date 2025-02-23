package db

import "time"

type Song struct {
	ID    uint `gorm:"primarykey"`
	Title string
}
type Set struct {
	ID     uint `gorm:"primarykey"`
	Number int
	Songs  []Song `gorm:"many2many:set_songs;"`
}
type Show struct {
	ID    uint      `gorm:"primarykey"`
	Date  time.Time `gorm:"type:date"`
	Venue string
	City  string
	State string
	Sets  []Set `gorm:"many2many:show_sets;"`
}
