package server

import (
	"embed"
	"html/template"
	"io/fs"
	"net/http"
	"time"

	"github.com/dustin/go-humanize"
	"github.com/gin-gonic/gin"
)

//go:embed assets/**
var embeddedAssets embed.FS

//go:embed html/*.html
var embeddedHTMLFiles embed.FS

func Run() { // coverage-ignore
	router := createAndConfigureRouter()

	server := http.Server{
		Addr:    ":8080",
		Handler: router,
	}
	_ = server.ListenAndServe()
}

func createAndConfigureRouter() *gin.Engine {
	router := gin.Default()
	configureApplicationHandlers(router)

	return router
}

func configureApplicationHandlers(router *gin.Engine) {
	router.SetFuncMap(template.FuncMap{
		"formatDate":   formatDate,
		"formatNumber": formatNumber,
		"numbers":      numbers,
	})

	tmpl := template.Must(template.New("").Funcs(router.FuncMap).ParseFS(embeddedHTMLFiles, "html/*.html"))

	gratefulDeadHandlers := GetGratefulDeadHandlers(tmpl)

	router.GET("/", gratefulDeadHandlers.renderRoot)
	router.GET("/show/:year/:month/:day", gratefulDeadHandlers.renderShow)
	router.GET("/song/:song", gratefulDeadHandlers.renderShowsWithSong)
	router.GET("/songs", gratefulDeadHandlers.renderSongs)
	router.GET("/venue/:city/:venue", gratefulDeadHandlers.renderVenue)
	router.GET("/venues", gratefulDeadHandlers.renderVenues)
	router.GET("/city/:state/:city", gratefulDeadHandlers.renderCity)
	router.GET("/state/:state", gratefulDeadHandlers.renderState)
	router.GET("/country/:country", gratefulDeadHandlers.renderCountry)
	router.GET("/year/:year", gratefulDeadHandlers.renderYear)
	router.POST("/search", gratefulDeadHandlers.renderSongSearchResults)
	router.GET("/about", gratefulDeadHandlers.renderAbout)

	staticFiles, _ := fs.Sub(embeddedAssets, "assets")
	router.StaticFS("/static", http.FS(staticFiles))
}

func numbers(start, end int) []int {
	n := end - start + 1

	r := make([]int, n)
	for i := range n {
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
