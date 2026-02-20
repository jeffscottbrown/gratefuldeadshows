package server

import (
	"fmt"
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

const pageSize = 10

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
		Max:    pageSize,
		Offset: offsetInt,
	}
}

func getPagination(offset int, totalCount int, uri string, fields map[string]string) struct {
	NextOffset     int
	PreviousOffset int
	LastOffset     int
	CurrentOffset  int
	Message        string
	URI            string
	Fields         map[string]string
} {
	if offset < 0 {
		offset = 0
	} else if offset > (totalCount - pageSize) {
		offset = totalCount - pageSize
	}

	offset = int(math.Max(float64(offset), 0))

	nextOffset := offset + pageSize

	maxOffset := totalCount - pageSize
	if nextOffset > maxOffset {
		nextOffset = maxOffset
	}

	previousOffset := max(offset-pageSize, 0)

	const pageSize = pageSize

	// Compute total number of pages (rounding up)
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Compute current page (1-indexed)
	currentPage := (offset / pageSize) + 1
	if offset%pageSize != 0 {
		currentPage++
	}

	return struct {
		NextOffset     int
		PreviousOffset int
		LastOffset     int
		CurrentOffset  int
		Message        string
		URI            string
		Fields         map[string]string
	}{
		NextOffset:     nextOffset,
		PreviousOffset: previousOffset,
		LastOffset:     maxOffset,
		CurrentOffset:  offset,
		Message:        fmt.Sprintf("Page %d of %d", currentPage, totalPages),
		URI:            uri,
		Fields:         fields,
	}
}
