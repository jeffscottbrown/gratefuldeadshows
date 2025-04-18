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

var tmpl *template.Template

func configureApplicationHandlers(router *gin.Engine) {
	router.SetFuncMap(template.FuncMap{
		"formatDate":   formatDate,
		"dict":         dict,
		"formatNumber": formatNumber,
		"numbers":      numbers,
	})

	tmpl = template.Must(template.New("").Funcs(router.FuncMap).ParseGlob("server/html/*.html"))

	router.GET("/", renderRoot)
	router.GET("/show/:year/:month/:day", renderShow)
	router.GET("/song/:song", renderShowsWithSong)
	router.GET("/songs", renderSongs)
	router.GET("/venue/:city/:venue", renderVenue)
	router.GET("/venues", renderVenues)
	router.GET("/city/:state/:city", renderCity)
	router.GET("/state/:state", renderState)
	router.GET("/country/:country", renderCountry)
	router.GET("/year/:year", renderYear)
	router.GET("/numbers", renderNumbers)
	router.POST("/search", renderSongSearchResults)
	router.GET("/about", renderAbout)

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
