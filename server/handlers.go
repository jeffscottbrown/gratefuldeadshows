package server

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jeffscottbrown/gratefuldeadshows/db"
	"gorm.io/gorm"
)

func renderShow(c *gin.Context) {
	year := c.Param("year")
	month := c.Param("month")
	day := c.Param("day")

	show, err := db.GetShowByDate(year, month, day)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			renderNotFound(c, gin.H{
				"Message": fmt.Sprintf("Show Not Found: %s-%s-%s", year, month, day),
			})
		} else {
			renderBadRequest(c, gin.H{
				"Message": fmt.Sprintf("Show Not Found: %s-%s-%s [%s]", year, month, day, err),
			})
		}
		return
	}

	renderTemplate(c, "show", gin.H{
		"Title": fmt.Sprintf("Show - %s", show.Date.Format("January 2, 2006")),
		"Show":  &show,
	})
}

func renderRoot(c *gin.Context) {
	renderTemplate(c, "home", gin.H{})
}

func renderSongs(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	results := db.GetSongs(pagingInfo.Max, pagingInfo.Offset)

	pagination := getPagination(pagingInfo.Offset, results.TotalCount, "/songs", nil)

	renderTemplate(c, "songs", gin.H{
		"Songs":      results.Songs,
		"Title":      fmt.Sprintf("%d Songs", results.TotalCount),
		"Pagination": pagination,
	})
}

func renderVenues(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	results := db.GetVenues(pagingInfo.Max, pagingInfo.Offset)

	renderTemplate(c, "venues", gin.H{
		"Venues":     results.Venues,
		"Title":      fmt.Sprintf("%d Venues", results.TotalCount),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/venues", nil),
	})
}

func renderVenue(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	venue := c.Param("venue")
	city := c.Param("city")
	results := db.GetShowsAtVenue(venue, city, pagingInfo.Max, pagingInfo.Offset)

	if results.TotalCount == 0 {
		renderNotFound(c, gin.H{
			"Message": fmt.Sprintf("No Shows Found At %s In %s", venue, city),
		})
		return
	}
	data := map[string]string{
		"venue": venue,
		"city":  city,
	}

	renderTemplate(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%d shows at %s in %s", results.TotalCount, venue, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/venue/%s/%s", city, venue), data),
	})
}

func renderCity(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	city := c.Param("city")
	state := c.Param("state")
	results := db.GetShowsInCity(city, state, pagingInfo.Max, pagingInfo.Offset)

	if results.TotalCount == 0 {
		renderNotFound(c, gin.H{
			"Message": fmt.Sprintf("No Shows Found In %s %s", city, state),
		})
		return
	}

	data := map[string]string{
		"city": city,
	}
	renderTemplate(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%d Shows In %s", results.TotalCount, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/city/%s/%s", state, city), data),
	})
}

func renderNumbers(c *gin.Context) {
	renderTemplate(c, "numbers", gin.H{
		"GratefulDeadHistory": db.History,
		"Title":               "Numbers",
	})
}

func renderYear(c *gin.Context) {
	year := c.Param("year")

	shows := db.GetShowsInYear(year)
	numberOfShows := len(shows)

	renderTemplate(c, "shows", gin.H{
		"Shows": shows,
		"Title": fmt.Sprintf("There Were %d Shows In %s", numberOfShows, year),
	})
}

func renderState(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	state := c.Param("state")
	results := db.GetShowsInState(state, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"state": state,
	}

	renderTemplate(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%d Shows In %s", results.TotalCount, state),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/state/%s", state), data),
	})
}

func renderShowsWithSong(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	songName := c.Param("song")

	result := db.GetShowsWithSong(songName, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"song": songName,
	}
	if result.TotalCount == 0 {
		renderNotFound(c, gin.H{
			"Message": fmt.Sprintf("No Shows Found With Song: %s", songName),
		})
		return
	}

	renderTemplate(c, "shows", gin.H{
		"Shows":      result.Shows,
		"Title":      fmt.Sprintf("%s Was Played At %d Shows", result.SongTitle, result.TotalCount),
		"Pagination": getPagination(pagingInfo.Offset, result.TotalCount, fmt.Sprintf("/song/%s", songName), data),
	})
}

func renderCountry(c *gin.Context) {

	country := c.Param("country")
	pagingInfo := createOffsetAndMaxForPagination(c)
	results := db.GetShowsInCountry(country, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"country": country,
	}

	renderTemplate(c, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%s Shows In %s", formatNumber(results.TotalCount), country),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/country/%s", country), data),
	})
}

func renderSongSearchResults(ctx *gin.Context) {
	query := ctx.PostForm("songTitle")
	songs := db.SongSearch(query)
	renderTemplate(ctx, "songTable", gin.H{
		"Songs": songs,
	})
}

func renderAbout(ctx *gin.Context) {
	renderTemplate(ctx, "about", gin.H{
		"Title": "About",
	})
}
