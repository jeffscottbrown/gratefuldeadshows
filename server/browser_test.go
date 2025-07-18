package server

import (
	"strings"
	"testing"
	"time"

	"github.com/playwright-community/playwright-go"
	"github.com/stretchr/testify/assert"
)

func TestSongSearch(t *testing.T) {
	go Run()
	time.Sleep(500 * time.Millisecond)

	err := playwright.Install()
	assert.NoError(t, err)

	pw, err := playwright.Run()
	assert.NoError(t, err)
	defer pw.Stop()

	browser, err := pw.Chromium.Launch()
	assert.NoError(t, err)
	defer browser.Close()

	page, err := browser.NewPage()
	assert.NoError(t, err)

	_, err = page.Goto("http://localhost:8080/songs")
	assert.NoError(t, err)

	input := page.Locator("input[type='text']")
	err = input.PressSequentially("Sug")
	assert.NoError(t, err)
	_, err = page.WaitForFunction(
		`() => {
		const rows = document.querySelectorAll("table tbody tr");
		return rows.length === 3; 
	}`,
		nil,
	)
	assert.NoError(t, err)

	rows := page.Locator("table tbody tr")

	expected := []string{
		"Sugar Magnolia",
		"Sugar Shack",
		"Sugaree",
	}

	for i, expectedText := range expected {
		row := rows.Nth(i)
		firstCell := row.Locator("td").First()

		text, err := firstCell.TextContent()
		assert.NoError(t, err, "Failed to get text from row %d", i+1)

		text = strings.TrimSpace(text)
		assert.Equal(t, expectedText, text, "Row %d text mismatch", i+1)
	}
}
