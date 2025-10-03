package server

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jeffscottbrown/gratefuldeadshows/db"
	"gorm.io/gorm"
)

type GratefulDeadHandlers struct {
	database *db.GratefulDeadDatabase
}

func GetGratefulDeadHandlers() *GratefulDeadHandlers {
	return &GratefulDeadHandlers{
		database: db.NewGratefulDeadDatabase(),
	}
}

func (gdh *GratefulDeadHandlers) renderShow(ginContext *gin.Context) {
	year := ginContext.Param("year")
	month := ginContext.Param("month")
	day := ginContext.Param("day")

	show, err := gdh.database.GetShowByDate(year, month, day)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			renderNotFound(ginContext, gin.H{
				"Message": fmt.Sprintf("Show Not Found: %s-%s-%s", year, month, day),
			})
		} else {
			renderBadRequest(ginContext, gin.H{
				"Message": fmt.Sprintf("Show Not Found: %s-%s-%s [%s]", year, month, day, err),
			})
		}

		return
	}

	renderTemplate(ginContext, "show", gin.H{
		"Title": "Show - " + show.Date.Format("January 2, 2006"),
		"Show":  &show,
	})
}

func (gdh *GratefulDeadHandlers) renderRoot(c *gin.Context) {
	renderTemplate(c, "home", gin.H{})
}

func (gdh *GratefulDeadHandlers) renderSongs(ginContext *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(ginContext)

	results := gdh.database.GetSongs(pagingInfo.Max, pagingInfo.Offset)

	pagination := getPagination(pagingInfo.Offset, results.TotalCount, "/songs", nil)

	renderTemplate(ginContext, "songs", gin.H{
		"Songs":      results.Songs,
		"Title":      fmt.Sprintf("%d Songs", results.TotalCount),
		"Pagination": pagination,
	})
}

func (gdh *GratefulDeadHandlers) renderVenues(c *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(c)

	results := gdh.database.GetVenues(pagingInfo.Max, pagingInfo.Offset)

	renderTemplate(c, "venues", gin.H{
		"Venues":     results.Venues,
		"Title":      fmt.Sprintf("%d Venues", results.TotalCount),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/venues", nil),
	})
}

func (gdh *GratefulDeadHandlers) renderVenue(ginContext *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(ginContext)

	venue := ginContext.Param("venue")
	city := ginContext.Param("city")
	results := gdh.database.GetShowsAtVenue(venue, city, pagingInfo.Max, pagingInfo.Offset)

	if results.TotalCount == 0 {
		renderNotFound(ginContext, gin.H{
			"Message": fmt.Sprintf("No Shows Found At %s In %s", venue, city),
		})

		return
	}

	data := map[string]string{
		"venue": venue,
		"city":  city,
	}

	renderTemplate(ginContext, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%d shows at %s in %s", results.TotalCount, venue, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/venue/%s/%s", city, venue), data),
	})
}

func (gdh *GratefulDeadHandlers) renderCity(ginContext *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(ginContext)

	city := ginContext.Param("city")
	state := ginContext.Param("state")
	results := gdh.database.GetShowsInCity(city, state, pagingInfo.Max, pagingInfo.Offset)

	if results.TotalCount == 0 {
		renderNotFound(ginContext, gin.H{
			"Message": fmt.Sprintf("No Shows Found In %s %s", city, state),
		})

		return
	}

	data := map[string]string{
		"city": city,
	}
	renderTemplate(ginContext, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%d Shows In %s", results.TotalCount, city),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, fmt.Sprintf("/city/%s/%s", state, city), data),
	})
}

func (gdh *GratefulDeadHandlers) renderYear(ginContext *gin.Context) {
	year := ginContext.Param("year")

	shows := gdh.database.GetShowsInYear(year)
	numberOfShows := len(shows)

	renderTemplate(ginContext, "shows", gin.H{
		"Shows": shows,
		"Title": fmt.Sprintf("There Were %d Shows In %s", numberOfShows, year),
	})
}

func (gdh *GratefulDeadHandlers) renderState(ginContext *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(ginContext)

	state := ginContext.Param("state")
	results := gdh.database.GetShowsInState(state, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"state": state,
	}

	renderTemplate(ginContext, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%d Shows In %s", results.TotalCount, state),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/state/"+state, data),
	})
}

func (gdh *GratefulDeadHandlers) renderShowsWithSong(ginContext *gin.Context) {
	pagingInfo := createOffsetAndMaxForPagination(ginContext)

	songName := ginContext.Param("song")

	result := gdh.database.GetShowsWithSong(songName, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"song": songName,
	}
	if result.TotalCount == 0 {
		renderNotFound(ginContext, gin.H{
			"Message": "No Shows Found With Song: " + songName,
		})

		return
	}

	renderTemplate(ginContext, "shows", gin.H{
		"Shows":      result.Shows,
		"Title":      fmt.Sprintf("%s Was Played At %d Shows", result.SongTitle, result.TotalCount),
		"Pagination": getPagination(pagingInfo.Offset, result.TotalCount, "/song/%s"+songName, data),
	})
}

func (gdh *GratefulDeadHandlers) renderCountry(ginContext *gin.Context) {
	country := ginContext.Param("country")
	pagingInfo := createOffsetAndMaxForPagination(ginContext)
	results := gdh.database.GetShowsInCountry(country, pagingInfo.Max, pagingInfo.Offset)

	data := map[string]string{
		"country": country,
	}

	renderTemplate(ginContext, "shows", gin.H{
		"Shows":      results.Shows,
		"Title":      fmt.Sprintf("%s Shows In %s", formatNumber(results.TotalCount), country),
		"Pagination": getPagination(pagingInfo.Offset, results.TotalCount, "/country/"+country, data),
	})
}

func (gdh *GratefulDeadHandlers) renderSongSearchResults(ctx *gin.Context) {
	query := ctx.PostForm("songTitle")
	songs := gdh.database.SongSearch(query)
	renderTemplate(ctx, "songTable", gin.H{
		"Songs": songs,
	})
}

func (gdh *GratefulDeadHandlers) renderAbout(ctx *gin.Context) {
	renderTemplate(ctx, "about", gin.H{
		"Title":               "About",
		"GratefulDeadHistory": gdh.database.GetHistory(),
	})
}
