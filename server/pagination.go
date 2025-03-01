package server

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func createOffsetAndMaxForPagination(c *gin.Context) struct {
	Max    int
	Offset int
} {
	offset := c.PostForm("offset")
	max := c.PostForm("max")

	offsetInt, err := strconv.Atoi(offset)
	if err != nil || offsetInt < 0 {
		offsetInt = 0
	}

	maxInt, err := strconv.Atoi(max)
	if err != nil || maxInt > 20 {
		maxInt = 10
	}
	return struct {
		Max    int
		Offset int
	}{
		Max:    maxInt,
		Offset: offsetInt,
	}
}

func getPagination(offset int, totalCount int, uri string, fields map[string]string) struct {
	NextOffset     int
	PreviousOffset int
	LastOffset     int
	Uri            string
	Fields         map[string]string
} {
	if offset < 0 {
		offset = 0
	}
	nextOffset := offset + 10

	maxOffset := totalCount - 10
	if nextOffset > maxOffset {
		nextOffset = maxOffset
	}

	previousOffset := offset - 10
	if previousOffset < 0 {
		previousOffset = 0
	}
	return struct {
		NextOffset     int
		PreviousOffset int
		LastOffset     int
		Uri            string
		Fields         map[string]string
	}{
		NextOffset:     nextOffset,
		PreviousOffset: previousOffset,
		LastOffset:     maxOffset,
		Uri:            uri,
		Fields:         fields,
	}
}
