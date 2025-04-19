package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

var router = createAndConfigureRouter()

func TestStaticResources(t *testing.T) {
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
	verifyResponse(t, RequestExpectation{
		path:         "/",
		expectedCode: http.StatusOK,
		expectedBody: "The Music Never Stopped",
	})
}

func TestSearchByCity(t *testing.T) {
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
	for _, tt := range tests {
		verifyResponse(t, tt)
	}
}

func verifyResponse(t *testing.T, tt RequestExpectation) {
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", tt.path, nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, tt.expectedCode, w.Code)
	assert.True(t, strings.Contains(w.Body.String(), tt.expectedBody), "Response should contain %s", tt.expectedBody)
}

type RequestExpectation struct {
	path         string
	expectedCode int
	expectedBody string
}
