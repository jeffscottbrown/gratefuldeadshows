package server

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPagination(t *testing.T) {

	assertPaging(t, 0, 0, 35, "Page 1 of 4")

	for i := 1; i <= 10; i++ {
		assertPaging(t, i, i, 35, "Page 2 of 4")
	}

	for i := 11; i <= 20; i++ {
		assertPaging(t, i, i, 35, "Page 3 of 4")
	}

	for i := 21; i <= 25; i++ {
		assertPaging(t, i, i, 35, "Page 4 of 4")
	}

	for i := 26; i < 35; i++ {
		assertPaging(t, i, 25, 35, "Page 4 of 4")
	}
}

func assertPaging(t *testing.T, requestedOffset int, expectedOffset int, limit int, expectedPage string) {
	pageInfo := getPagination(requestedOffset, limit, "/", map[string]string{})
	assert.Equal(t, expectedPage, pageInfo.Message, "Test failed for offset=%d", requestedOffset)
	assert.Equal(t, expectedOffset, pageInfo.CurrentOffset, "Test failed for offset=%d", requestedOffset)
}
