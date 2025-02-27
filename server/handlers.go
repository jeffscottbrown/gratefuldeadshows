package server

import (
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jeffscottbrown/gratefulweb/db"
)

func renderQuote(c *gin.Context) {
	c.String(http.StatusOK, getRandomGratefulDeadQuote())
}

func renderShow(c *gin.Context) {
	id := c.PostForm("id")
	idInt, err := strconv.Atoi(id)
	if err != nil || idInt < 0 {
		c.HTML(http.StatusBadRequest, "error.html", gin.H{
			"Message": "Invalid Show ID",
		})
	} else {
		show := db.GetShow(idInt)
		c.HTML(http.StatusOK, "show.html", gin.H{
			"Show":    show,
			"Message": "Show On " + show.Date.Format("January 11, 2006"),
		})
	}
}

func renderRoot(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{})
}

func renderSongs(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	songs := db.GetSongs(pagingInfo.Max, pagingInfo.Offset)

	c.HTML(http.StatusOK, "songs.html", gin.H{
		"Songs":      songs,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/songs", nil),
	})
}

func renderVenues(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	venues := db.GetVenues(pagingInfo.Max, pagingInfo.Offset)

	c.HTML(http.StatusOK, "venues.html", gin.H{
		"Venues":     venues,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/venues", nil),
	})
}

func renderVenue(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	venue := c.PostForm("venue")
	city := c.PostForm("city")
	shows := db.GetShowsAtVenue(venue, city, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"venue": venue,
		"city":  city,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      shows,
		"Message":    "All Shows At " + venue + " In " + city,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/venue", data),
	})
}

func renderCity(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	city := c.PostForm("city")
	shows := db.GetShowsInCity(city, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"city": city,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      shows,
		"Message":    "All Shows In " + city,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/city", data),
	})
}

func renderYear(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	year := c.PostForm("year")

	shows := db.GetShowsInYear(year, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"year": year,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      shows,
		"Message":    "All Shows From " + year,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/year", data),
	})
}

func renderState(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	state := c.PostForm("state")
	shows := db.GetShowsInState(state, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"state": state,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      shows,
		"Message":    "All Shows In " + state,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/state", data),
	})
}

func renderShowsWithSong(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	song := c.PostForm("songTitle")
	shows := db.GetShowsWithSong(song, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"song": song,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      shows,
		"Message":    "Shows When The Band Played " + song,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/song", data),
	})
}

func renderCountry(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	country := c.PostForm("country")
	shows := db.GetShowsInCountry(country, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"country": country,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      shows,
		"Message":    "All Shows In " + country,
		"Pagination": getPagination(pagingInfo.Max, pagingInfo.Offset, "/country", data),
	})
}

func getRandomGratefulDeadQuote() string {
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
