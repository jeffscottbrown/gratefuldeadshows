package main

import (
	"github.com/jeffscottbrown/gratefuldeadshows/server"
	_ "github.com/lib/pq"
)

func main() { // coverage-ignore
	server.Run()
}
