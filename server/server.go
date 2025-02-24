package server

import (
	"html/template"
	"math/rand"
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
		"dict":       dict,
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
		venueName := c.PostForm("venue")
		cityName := c.PostForm("city")
		shows := db.GetShowsAtVenue(venueName, cityName)
		c.HTML(http.StatusOK, "shows.html", gin.H{
			"Shows":   shows,
			"Message": "All Shows At " + venueName + " In " + cityName,
		})
	})
	router.POST("/show", func(c *gin.Context) {
		id := c.PostForm("id")
		idInt, err := strconv.Atoi(id)
		if err != nil || idInt < 0 {
			c.HTML(http.StatusBadRequest, "error.html", gin.H{
				"Message": "Invalid Show ID",
			})
			return
		}
		show := db.GetShow(idInt)
		c.HTML(http.StatusOK, "show.html", gin.H{
			"Show":    show,
			"Message": "Show On " + show.Date.Format("January 11, 2006"),
		})
	})
	router.POST("/song", func(c *gin.Context) {
		songTitle := c.PostForm("songTitle")
		shows := db.GetShowsWithSong(songTitle)
		c.HTML(http.StatusOK, "shows.html", gin.H{
			"Shows":   shows,
			"Message": "Shows When The Band Played " + songTitle,
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

	router.GET("/quote", func(c *gin.Context) {
		c.String(http.StatusOK, getRandomGratefulDeadQuote())
	})

	router.Static("/static", "server/assets")
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

func getRandomGratefulDeadQuote() string {
	rand.Seed(time.Now().UnixNano())
	return quotes[rand.Intn(len(quotes))]
}

var quotes = []string{
	"Once in a while you get shown the light in the strangest of places if you look at it right.",
	"Sometimes the light's all shining on me, other times I can barely see.",
	"Without love in the dream, it will never come true.",
	"Strangers stopping strangers just to shake their hand.",
	"Nothing left to do but smile, smile, smile.",
	"Every silver lining's got a touch of grey.",
	"Wake up to find out that you are the eyes of the world.",
	"Let there be songs to fill the air.",
	"Ripple in still water, when there is no pebble tossed, nor wind to blow.",
	"Once in a while you get shown the light in the strangest of places if you look at it right.",
	"Sometimes we live no particular way but our own.",
	"Such a long, long time to be gone, and a short time to be there.",
	"Shall we go, you and I while we can?",
	"Fare you well, fare you well, I love you more than words can tell.",
	"Come hear Uncle John's Band by the riverside.",
	"Don't tell me this town ain't got no heart.",
	"Light the song with sense and color, hold away despair.",
	"Reach out your hand if your cup be empty.",
	"Let there be songs to fill the air.",
	"Once in a while you get shown the light in the strangest of places if you look at it right.",
}
