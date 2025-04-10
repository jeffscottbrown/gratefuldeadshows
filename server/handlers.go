package server

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jeffscottbrown/gratefuldeadshows/db"
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
		"Message":    fmt.Sprintf("%d Songs", results.TotalCount),
		"Pagination": pagination,
	})
}

func renderVenues(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	results := db.GetVenues(pagingInfo.Max, pagingInfo.Offset)

	c.HTML(http.StatusOK, "venues.html", gin.H{
		"Venues":     results.Venues,
		"Message":    fmt.Sprintf("%d Venues", results.TotalCount),
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
		"Message":    fmt.Sprintf("%d shows at %s in %s", results.TotalCount, venue, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/venue", data),
	})
}

func renderCity(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	city := c.PostForm("city")
	state := c.PostForm("state")
	results := db.GetShowsInCity(city, state, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"city": city,
	}

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":      results.Shows,
		"Message":    fmt.Sprintf("%d Shows In %s", results.TotalCount, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/city", data),
	})
}

func renderNumbers(c *gin.Context) {
	c.HTML(http.StatusOK, "numbers.html", gin.H{
		"GratefulDeadHistory": db.History,
	})
}

func renderYear(c *gin.Context) {
	year := c.PostForm("year")

	shows := db.GetShowsInYear(year)
	numberOfShows := len(shows)

	c.HTML(http.StatusOK, "shows.html", gin.H{
		"Shows":   shows,
		"Message": fmt.Sprintf("There Were %d Shows In %s", numberOfShows, year),
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
		"Message":    fmt.Sprintf("%d Shows In %s", results.TotalCount, state),
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
		"Message":    fmt.Sprintf("%s Was Played At %d Shows", result.SongTitle, result.TotalCount),
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
		"Message":    fmt.Sprintf("%s Shows In %s", formatNumber(results.TotalCount), country),
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

func renderAbout(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "about.html", gin.H{})
}
