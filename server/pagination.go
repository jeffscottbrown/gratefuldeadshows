package server

import (
	"fmt"
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

func createOffsetAndMaxForPagination(c *gin.Context) struct {
	Max    int
	Offset int
} {
	offset := c.Query("offset")

	offsetInt, err := strconv.Atoi(offset)
	if err != nil || offsetInt < 0 {
		offsetInt = 0
	}

	return struct {
		Max    int
		Offset int
	}{
		Max:    10,
		Offset: offsetInt,
	}
}

func getPagination(offset int, totalCount int, uri string, fields map[string]string) struct {
	NextOffset     int
	PreviousOffset int
	LastOffset     int
	CurrentOffset  int
	Message        string
	Uri            string
	Fields         map[string]string
} {
	if offset < 0 {
		offset = 0
	} else if offset > (totalCount - 10) {
		offset = totalCount - 10
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

	const pageSize = 10

	// Compute total number of pages (rounding up)
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Compute current page (1-indexed)
	currentPage := (offset / pageSize) + 1
	if offset%pageSize != 0 {
		currentPage++
	}

	// Clamp currentPage to within range
	if currentPage > totalPages {
		currentPage = totalPages
	}
	if currentPage < 1 && totalPages > 0 {
		currentPage = 1
	}

	return struct {
		NextOffset     int
		PreviousOffset int
		LastOffset     int
		CurrentOffset  int
		Message        string
		Uri            string
		Fields         map[string]string
	}{
		NextOffset:     nextOffset,
		PreviousOffset: previousOffset,
		LastOffset:     maxOffset,
		CurrentOffset:  offset,
		Message:        fmt.Sprintf("Page %d of %d", currentPage, totalPages),
		Uri:            uri,
		Fields:         fields,
	}
}
