package server

import (
	"html/template"

	"github.com/gin-gonic/gin"
)

func renderPage(c *gin.Context, name string, data gin.H) {
	isHTMX := c.GetHeader("HX-Request") != ""

	if isHTMX {
		_ = tmpl.ExecuteTemplate(c.Writer, name, data)
		return
	}

	// Render layout and pass the inner content manually
	layoutData := gin.H{
		"Title": "Jeff Was Here In The Title",
	}

	switch name {
	case "index":
		layoutData["Body"] = template.HTML(renderTemplateToString("index", data))
	case "shows":
		layoutData["Body"] = template.HTML(renderTemplateToString("shows", data))
	case "show":
		layoutData["Body"] = template.HTML(renderTemplateToString("show", data))
	case "songs":
		layoutData["Body"] = template.HTML(renderTemplateToString("songs", data))
	case "numbers":
		layoutData["Body"] = template.HTML(renderTemplateToString("numbers", data))
	case "error":
		layoutData["Body"] = template.HTML(renderTemplateToString("error", data))
	case "venues":
		layoutData["Body"] = template.HTML(renderTemplateToString("venues", data))
	case "about":
		layoutData["Body"] = template.HTML(renderTemplateToString("about", data))
	}

	_ = tmpl.ExecuteTemplate(c.Writer, "index", layoutData)
}

func renderTemplateToString(name string, data any) string {
	var buf []byte
	writer := &buffer{&buf}
	_ = tmpl.ExecuteTemplate(writer, name, data)
	return string(*writer.buf)
}

type buffer struct {
	buf *[]byte
}

func (w *buffer) Write(p []byte) (int, error) {
	*w.buf = append(*w.buf, p...)
	return len(p), nil
}
