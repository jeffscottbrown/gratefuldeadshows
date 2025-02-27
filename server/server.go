package server

import (
	"html/template"
	"net/http"
	"time"

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
		"formatDate": formatDate,
		"dict":       dict,
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
	router.GET("/quote", renderQuote)

	router.Static("/static", "server/assets/")
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
