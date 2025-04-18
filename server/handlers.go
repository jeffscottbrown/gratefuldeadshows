package server

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jeffscottbrown/gratefuldeadshows/db"
)

func renderShow(c *gin.Context) {
	id := c.Param("id")
	idInt, err := strconv.Atoi(id)
	if err != nil || idInt < 0 {
		renderPage(c, "error", gin.H{
			"Message": "Invalid Show ID",
		})
	} else {
		show := db.GetShow(idInt)
		renderPage(c, "show", gin.H{
			"Show":    show,
			"Message": "Show On " + show.Date.Format("January 11, 2006"),
		})
	}
}

func renderRoot(c *gin.Context) {
	renderPage(c, "home", gin.H{})
}

func renderSongs(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	results := db.GetSongs(pagingInfo.Max, pagingInfo.Offset)

	pagination := getPagination(pagingInfo.Offset, results.TotalCount, "/songs", nil)

	renderPage(c, "songs", gin.H{
		"Songs":      results.Songs,
		"Message":    fmt.Sprintf("%d Songs", results.TotalCount),
		"Pagination": pagination,
	})
}

func renderVenues(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	results := db.GetVenues(pagingInfo.Max, pagingInfo.Offset)

	renderPage(c, "venues", gin.H{
		"Venues":     results.Venues,
		"Message":    fmt.Sprintf("%d Venues", results.TotalCount),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/venues", nil),
	})
}

func renderVenue(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	venue := c.Param("venue")
	city := c.Param("city")
	results := db.GetShowsAtVenue(venue, city, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"venue": venue,
		"city":  city,
	}

	renderPage(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Message":    fmt.Sprintf("%d shows at %s in %s", results.TotalCount, venue, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/venue/%s/%s", city, venue), data),
	})
}

func renderCity(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	city := c.Param("city")
	state := c.Param("state")
	results := db.GetShowsInCity(city, state, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"city": city,
	}
	renderPage(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Message":    fmt.Sprintf("%d Shows In %s", results.TotalCount, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/city/%s/%s", state, city), data),
	})
}

func renderNumbers(c *gin.Context) {
	renderPage(c, "numbers", gin.H{
		"GratefulDeadHistory": db.History,
	})
}

func renderYear(c *gin.Context) {
	year := c.Param("year")

	shows := db.GetShowsInYear(year)
	numberOfShows := len(shows)

	renderPage(c, "shows", gin.H{
		"Shows":   shows,
		"Message": fmt.Sprintf("There Were %d Shows In %s", numberOfShows, year),
	})
}

func renderState(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	state := c.Param("state")
	results := db.GetShowsInState(state, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"state": state,
	}

	renderPage(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Message":    fmt.Sprintf("%d Shows In %s", results.TotalCount, state),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/state/%s", state), data),
	})
}

func renderShowsWithSong(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	songIdString := c.Param("song")

	songId, _ := strconv.Atoi(songIdString)

	result := db.GetShowsWithSong(songId, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"song": songIdString,
	}

	renderPage(c, "shows", gin.H{
		"Shows":      result.Shows,
		"Message":    fmt.Sprintf("%s Was Played At %d Shows", result.SongTitle, result.TotalCount),
		"Pagination": getPagination(pagingInfo.Offset, result.TotalCount, fmt.Sprintf("/song/%d", songId), data),
	})
}

func renderCountry(c *gin.Context) {

	country := c.Param("country")
	pagingInfo := createOffsetAndMaxForPagination(c)
	results := db.GetShowsInCountry(country, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"country": country,
	}

	renderPage(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Message":    fmt.Sprintf("%s Shows In %s", formatNumber(results.TotalCount), country),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/country/%s", country), data),
	})
}

func renderSongSearchResults(ctx *gin.Context) {
	query := ctx.PostForm("songTitle")
	songs := db.SongSearch(query)
	renderPage(ctx, "songTable", gin.H{
		"Songs": songs,
	})
}

func renderAbout(ctx *gin.Context) {
	renderPage(ctx, "about", gin.H{})
}
