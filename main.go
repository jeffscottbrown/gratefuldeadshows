package main

import (
	"github.com/jeffscottbrown/gratefulweb/db"
	"github.com/jeffscottbrown/gratefulweb/server"
	_ "github.com/lib/pq"
)

func main() {
	db.PrintStatistics()
	server.Run()
}
