package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

var router = createAndConfigureRouter()

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
