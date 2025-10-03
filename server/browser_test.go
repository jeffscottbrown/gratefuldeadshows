package server

import (
	"strings"
	"testing"
	"time"

	"github.com/playwright-community/playwright-go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSongSearch(t *testing.T) {
	t.Parallel()

	go Run()

	time.Sleep(500 * time.Millisecond)

	err := playwright.Install()
	require.NoError(t, err)

	playwrightRun, err := playwright.Run()
	require.NoError(t, err)

	defer func() {
		_ = playwrightRun.Stop()
	}()

	browser, err := playwrightRun.Chromium.Launch()
	require.NoError(t, err)

	defer func() {
		_ = browser.Close()
	}()

	page, err := browser.NewPage()
	require.NoError(t, err)

	_, err = page.Goto("http://localhost:8080/songs")
	require.NoError(t, err)

	input := page.Locator("input[type='text']")
	err = input.PressSequentially("Sug")
	require.NoError(t, err)
	_, err = page.WaitForFunction(
		`() => {
		const rows = document.querySelectorAll("table tbody tr");
		return rows.length === 3; 
	}`,
		nil,
	)
	require.NoError(t, err)

	rows := page.Locator("table tbody tr")

	expected := []string{
		"Sugar Magnolia",
		"Sugar Shack",
		"Sugaree",
	}

	for idx, expectedText := range expected {
		row := rows.Nth(idx)
		firstCell := row.Locator("td").First()

		text, err := firstCell.TextContent()
		require.NoError(t, err, "Failed to get text from row %d", idx+1)

		text = strings.TrimSpace(text)
		assert.Equal(t, expectedText, text, "Row %d text mismatch", idx+1)
	}
}
