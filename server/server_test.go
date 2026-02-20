package server

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

func (s *ServerTestSuite) TestTitles() {
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
	s.verifyResponses(tests)
}

func (s *ServerTestSuite) TestStaticResources() {
	s.verifyResponses([]RequestExpectation{{
		path:         "/static/css/main.css",
		expectedCode: http.StatusOK,
		expectedBody: "main",
	}, {
		path:         "/static/css/doesnotexist.css",
		expectedCode: http.StatusNotFound,
		expectedBody: "",
	}})
}

func (s *ServerTestSuite) TestShowsByDate() {
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

	s.verifyResponses(tests)
}

func (s *ServerTestSuite) TestHomePage() {
	s.verifyResponse(RequestExpectation{
		path:         "/",
		expectedCode: http.StatusOK,
		expectedBody: "The Music Never Stopped",
	})
}

func (s *ServerTestSuite) TestSearchByCity() {
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
	s.verifyResponses(tests)
}

func (s *ServerTestSuite) TestSearchByVenue() {
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
	s.verifyResponses(tests)
}

func (s *ServerTestSuite) TestShowsBySong() {
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

	s.verifyResponses(tests)
}

type RequestExpectation struct {
	path         string
	expectedCode int
	expectedBody string
}

type ServerTestSuite struct {
	suite.Suite

	router *gin.Engine
}

func (s *ServerTestSuite) SetupSuite() {
	s.router = createAndConfigureRouter()
}

func TestServer(t *testing.T) { //nolint:paralleltest
	suite.Run(t, new(ServerTestSuite))
}

func (s *ServerTestSuite) verifyResponse(expectation RequestExpectation) {
	s.T().Helper()

	recorder := httptest.NewRecorder()
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, expectation.path, nil)
	s.router.ServeHTTP(recorder, req)

	s.Equal(expectation.expectedCode, recorder.Code)
	s.Contains(recorder.Body.String(), expectation.expectedBody,
		"Response should contain %s", expectation.expectedBody)
}

func (s *ServerTestSuite) verifyResponses(tests []RequestExpectation) {
	s.T().Helper()

	for _, tt := range tests {
		s.verifyResponse(tt)
	}
}
