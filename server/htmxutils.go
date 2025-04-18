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

	layoutData := gin.H{
		"Body": template.HTML(renderTemplateToString(name, data)),
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
