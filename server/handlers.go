package server

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jeffscottbrown/gratefulweb/db"
)

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

	results := db.GetSongs(pagingInfo.Max, pagingInfo.Offset)

	pagination := getPagination(pagingInfo.Offset, results.TotalCount, "/songs", nil)

	c.HTML(http.StatusOK, "songs.html", gin.H{
		"Songs":      results.Songs,
		"Pagination": pagination,
	})
}

func renderVenues(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	results := db.GetVenues(pagingInfo.Max, pagingInfo.Offset)

	c.HTML(http.StatusOK, "venues.html", gin.H{
		"Venues":     results.Venues,
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/venues", nil),
	})
}

func renderVenue(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	venue := c.PostForm("venue")
	city := c.PostForm("city")
	results := db.GetShowsAtVenue(venue, city, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"venue": venue,
		"city":  city,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      results.Shows,
		"Message":    "Shows At " + venue + " In " + city,
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/venue", data),
	})
}

func renderCity(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	city := c.PostForm("city")
	results := db.GetShowsInCity(city, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"city": city,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      results.Shows,
		"Message":    "Shows In " + city,
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/city", data),
	})
}

func renderNumbers(c *gin.Context) {
	c.HTML(http.StatusOK, "numbers.html", gin.H{
		"GratefulDeadHistory": db.History,
	})
}

func renderYear(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	year := c.PostForm("year")

	results := db.GetShowsInYear(year, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"year": year,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      results.Shows,
		"Message":    "Shows From " + year,
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/year", data),
	})
}

func renderState(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	state := c.PostForm("state")
	results := db.GetShowsInState(state, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"state": state,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      results.Shows,
		"Message":    "Shows In " + state,
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/state", data),
	})
}

func renderShowsWithSong(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	songIdString := c.PostForm("song")

	songId, _ := strconv.Atoi(songIdString)

	result := db.GetShowsWithSong(songId, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"song": songIdString,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      result.Shows,
		"Message":    "Shows When The Band Played " + result.SongTitle,
		"Pagination": getPagination(pagingInfo.Offset, result.TotalCount, "/song", data),
	})
}

func renderCountry(c *gin.Context) {

	country := c.PostForm("country")
	pagingInfo := createOffsetAndMaxForPagination(c)
	results := db.GetShowsInCountry(country, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"country": country,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      results.Shows,
		"Message":    "Shows In " + country,
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/country", data),
	})
}

func renderSongSearchResults(ctx *gin.Context) {
	query := ctx.PostForm("songTitle")
	songs := db.SongSearch(query)
	ctx.HTML(http.StatusOK, "songTable", gin.H{
		"Songs": songs,
	})
}
