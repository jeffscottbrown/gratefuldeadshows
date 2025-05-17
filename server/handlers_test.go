package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRenderVenue(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = gin.Params{
		{Key: "venue", Value: "Kiel Auditorium"},
		{Key: "city", Value: "St. Louis"},
	}

	// The url in this request is not used
	c.Request = httptest.NewRequest("GET", "/", nil)

	renderVenue(c)

	assert.Equal(t, http.StatusOK, w.Code, "Expected status 200")

	doc, err := goquery.NewDocumentFromReader(w.Body)
	assert.NoError(t, err, "Expected no error parsing HTML")

	heading := doc.Find("h4")
	assert.Equal(t, 1, heading.Length(), "Expected one h4 element")
	assert.Equal(t, "7 shows at Kiel Auditorium in St. Louis",
		strings.TrimSpace(heading.Text()),
		"Expected h4 text to match venue name")

	tableRows := doc.Find("table tbody tr")
	assert.Equal(t, 7, tableRows.Length(), "Expected 7 shows in the table")

	previousAnchor := doc.Find("a:contains('Previous')")
	assert.Equal(t, 1, previousAnchor.Length(), "Expected one anchor with text 'Previous'")

	assert.True(t, previousAnchor.HasClass("disabled"),
		"Expected 'Previous' anchor to be disabled")
}
