package server

import (
	"html/template"
	"net/http"
	"time"

	"github.com/dustin/go-humanize"
	"github.com/gin-gonic/gin"
)

func Run() {
	router := createAndConfigureRouter()

	server := http.Server{
		Addr:    ":8080",
		Handler: router,
	}
	server.ListenAndServe()
}

func createAndConfigureRouter() *gin.Engine {
	router := gin.Default()
	configureApplicationHandlers(router)

	return router
}

func configureApplicationHandlers(router *gin.Engine) {
	router.SetFuncMap(template.FuncMap{
		"formatDate":   formatDate,
		"dict":         dict,
		"formatNumber": formatNumber,
		"numbers":      numbers,
	})
	router.LoadHTMLGlob("server/html/*")

	router.GET("/", renderRoot)
	router.POST("/show", renderShow)
	router.POST("/song", renderShowsWithSong)
	router.POST("/songs", renderSongs)
	router.POST("/venue", renderVenue)
	router.POST("/venues", renderVenues)
	router.POST("/city", renderCity)
	router.POST("/state", renderState)
	router.POST("/country", renderCountry)
	router.POST("/year", renderYear)
	router.POST("/numbers", renderNumbers)
	router.POST("/search", renderSongSearchResults)

	redir := func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/")
	}
	for _, route := range []string{"/numbers", "/search", "/show", "/song", "/songs", "/venue", "/venues", "/city", "/state", "/country", "/year"} {
		router.GET(route, redir)
	}

	router.Static("/static", "server/assets/")
}

func numbers(start, end int) []int {
	n := end - start + 1
	r := make([]int, n)
	for i := 0; i < n; i++ {
		r[i] = start + i
	}
	return r
}

func formatNumber(n int) string {
	return humanize.Comma(int64(n))
}

func formatDate(t time.Time, layout string) string {
	return t.Format(layout)
}

func dict(values ...interface{}) map[string]interface{} {
	m := make(map[string]interface{})
	for i := 0; i < len(values); i += 2 {
		m[values[i].(string)] = values[i+1]
	}
	return m
}
