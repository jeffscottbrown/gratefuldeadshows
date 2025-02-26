package main

import (
	"log/slog"

	"github.com/jeffscottbrown/gratefulweb/db"
	"github.com/jeffscottbrown/gratefulweb/server"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		slog.Debug("Failed to load .env file", "error", err)
	}

	db.PrintStatistics()
	server.Run()
}
