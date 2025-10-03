package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRenderVenue(t *testing.T) {
	t.Parallel()

	recorder := httptest.NewRecorder()
	testContext, _ := gin.CreateTestContext(recorder)
	testContext.Params = gin.Params{
		{Key: "venue", Value: "Kiel Auditorium"},
		{Key: "city", Value: "St. Louis"},
	}

	// The url in this request is not used
	testContext.Request = httptest.NewRequest(http.MethodGet, "/", nil)

	gdh := GetGratefulDeadHandlers()

	gdh.renderVenue(testContext)

	assert.Equal(t, http.StatusOK, recorder.Code, "Expected status 200")

	doc, err := goquery.NewDocumentFromReader(recorder.Body)
	require.NoError(t, err, "Expected no error parsing HTML")

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
