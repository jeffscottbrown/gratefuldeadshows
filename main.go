package main

import (
	"github.com/jeffscottbrown/gratefulweb/server"
	_ "github.com/lib/pq"
)

func main() {
	server.Run()
}
