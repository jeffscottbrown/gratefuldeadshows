package server

import (
	"html/template"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jeffscottbrown/gratefulweb/db"
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
	})
	router.LoadHTMLGlob("server/assets/html/*")
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})

	router.GET("/venues", func(c *gin.Context) {
		offset := c.DefaultQuery("offset", "0")
		offsetInt, err := strconv.Atoi(offset)
		if err != nil || offsetInt < 0 {
			offsetInt = 0
		}

		max := c.DefaultQuery("max", "10")
		maxInt, err := strconv.Atoi(max)
		if err != nil || maxInt > 20 {
			maxInt = 10
		}
		venues := db.GetVenues(maxInt, offsetInt)
		c.HTML(http.StatusOK, "venues.html", gin.H{
			"Venues":         venues,
			"NextOffset":     offsetInt + 10,
			"PreviousOffset": offsetInt - 10,
		})
	})
	router.POST("/venue", func(c *gin.Context) {
		venueName := c.PostForm("venueName")
		shows := db.GetShowsAtVenue(venueName)
		c.HTML(http.StatusOK, "shows.html", gin.H{
			"Shows":   shows,
			"Message": "All Shows At " + venueName,
		})
	})

	router.POST("/state", func(c *gin.Context) {
		stateName := c.PostForm("state")
		shows := db.GetShowsInState(stateName)
		c.HTML(http.StatusOK, "shows.html", gin.H{
			"Shows":   shows,
			"Message": "All Shows In " + stateName,
		})
	})

	router.POST("/year", func(c *gin.Context) {
		year := c.PostForm("year")
		shows := db.GetShowsInYear(year)
		c.HTML(http.StatusOK, "shows.html", gin.H{
			"Shows":   shows,
			"Message": "All Shows From " + year,
		})
	})

	router.POST("/city", func(c *gin.Context) {
		city := c.PostForm("city")
		shows := db.GetShowsInCity(city)
		c.HTML(http.StatusOK, "shows.html", gin.H{
			"Shows":   shows,
			"Message": "All Shows In " + city,
		})
	})

	router.Static("/static", "server/assets")
}

func formatDate(t time.Time, layout string) string {
	return t.Format(layout)
}
