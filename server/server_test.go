package server

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

var router = createAndConfigureRouter()

func TestTitles(t *testing.T) {
	t.Parallel()

	tests := []RequestExpectation{
		{
			path:         "/venues",
			expectedCode: http.StatusOK,
			expectedBody: "document.title = \"592 Venues\"",
		}, {
			path:         "/about",
			expectedCode: http.StatusOK,
			expectedBody: "document.title = \"About\"",
		}, {
			path:         "/venue/Ithaca/Barton Hall",
			expectedCode: http.StatusOK,
			expectedBody: "document.title = \"3 shows at Barton Hall in Ithaca\"",
		}, {
			path:         "/country/US",
			expectedCode: http.StatusOK,
			expectedBody: "document.title = \"2,211 Shows In US\"",
		}, {
			path:         "/state/MO",
			expectedCode: http.StatusOK,
			expectedBody: "document.title = \"32 Shows In MO\"",
		}, {
			path:         "/songs",
			expectedCode: http.StatusOK,
			expectedBody: "document.title = \"435 Songs\"",
		}, {
			path:         "/year/1977",
			expectedCode: http.StatusOK,
			expectedBody: "document.title = \"There Were 60 Shows In 1977\"",
		},
	}
	verifyResponses(t, tests)
}

func TestStaticResources(t *testing.T) {
	t.Parallel()

	verifyResponses(t, []RequestExpectation{{
		path:         "/static/css/main.css",
		expectedCode: http.StatusOK,
		expectedBody: "main",
	}, {
		path:         "/static/css/doesnotexist.css",
		expectedCode: http.StatusNotFound,
		expectedBody: "",
	}})
}

func TestShowsByDate(t *testing.T) {
	t.Parallel()

	tests := []RequestExpectation{
		{
			path:         "/show/1977/05/08",
			expectedCode: http.StatusOK,
			expectedBody: "May 8, 1977 at Barton Hall",
		},
		{
			path:         "/show/1977/01/01",
			expectedCode: http.StatusNotFound,
			expectedBody: "Show Not Found",
		},
		{
			path:         "/show/abcd/ef/gh",
			expectedCode: http.StatusBadRequest,
			expectedBody: "cannot parse",
		},
	}

	verifyResponses(t, tests)
}

func TestHomePage(t *testing.T) {
	t.Parallel()
	verifyResponse(t, RequestExpectation{
		path:         "/",
		expectedCode: http.StatusOK,
		expectedBody: "The Music Never Stopped",
	})
}

func TestSearchByCity(t *testing.T) {
	t.Parallel()

	tests := []RequestExpectation{
		{
			path:         "/city/GA/Atlanta",
			expectedCode: http.StatusOK,
			expectedBody: "Shows In Atlanta",
		}, {
			path:         "/city/GA/Norfolk",
			expectedCode: http.StatusNotFound,
			expectedBody: "No Shows Found In Norfolk GA",
		},
	}
	verifyResponses(t, tests)
}

func TestSearchByVenue(t *testing.T) {
	t.Parallel()

	tests := []RequestExpectation{
		{
			path:         "/venue/Ithaca/Barton Hall",
			expectedCode: http.StatusOK,
			expectedBody: "Barton Hall",
		}, {
			path:         "/venue/NoWhere/Wilson",
			expectedCode: http.StatusNotFound,
			expectedBody: "No Shows Found At Wilson In NoWhere",
		}, {
			path:         "/venues",
			expectedCode: http.StatusOK,
			expectedBody: "Venues",
		},
	}
	verifyResponses(t, tests)
}

func TestShowsBySong(t *testing.T) {
	t.Parallel()

	tests := []RequestExpectation{
		{
			path:         "/song/Sugaree",
			expectedCode: http.StatusOK,
			expectedBody: "Sugaree",
		},
		{
			path:         "/song/Twist",
			expectedCode: http.StatusNotFound,
			expectedBody: "No Shows Found With Song: Twist",
		},
	}

	verifyResponses(t, tests)
}

func verifyResponses(t *testing.T, tests []RequestExpectation) {
	t.Helper()

	for _, tt := range tests {
		verifyResponse(t, tt)
	}
}

func verifyResponse(t *testing.T, expectation RequestExpectation) {
	t.Helper()

	recorder := httptest.NewRecorder()
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, expectation.path, nil)
	router.ServeHTTP(recorder, req)

	assert.Equal(t, expectation.expectedCode, recorder.Code)
	assert.Contains(t,
		recorder.Body.String(), expectation.expectedBody,
		"Response should contain %s", expectation.expectedBody)
}

type RequestExpectation struct {
	path         string
	expectedCode int
	expectedBody string
}
