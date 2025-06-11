package main

import (
	"context"
	"encoding/json"
	"regexp"
	"strings"

	"iso8583-desktop-tool/internal/models"
	"iso8583-desktop-tool/internal/parser"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

func (a *App) ParseLog(log string) []string {
	// split line by regex
	lines := regexp.MustCompile(`\r?\n`).Split(log, -1)
	var result []string
	for _, line := range lines {
		line = strings.TrimSpace(line) // Loại bỏ dấu trắng và ký tự ẩn đầu/cuối
		if len(line) == 0 {
			continue
		}
		if strings.Contains(line, "MTI") || strings.Contains(line, "mti") {
			mess := a.getMessage(line)
			result = append(result, mess)
		}
	}

	return result
}

func (a *App) getMessage(line string) string {
	re := regexp.MustCompile(`(\s*[\[,\\-]*\[[^\[\]]*\])+$`)
	switch {
	case strings.Contains(line, "MTI"):
		idx := strings.Index(line, "MTI")
		if idx != -1 {
			sub := line[idx:]
			sub = re.ReplaceAllString(sub, "")
			return strings.TrimRight(sub, " ,-")
		}
		return ""
	case strings.Contains(line, "mti"):
		idx := strings.Index(line, `"mti"`)
		if idx != -1 {
			sub := line[idx:]
			sub = re.ReplaceAllString(sub, "")
			rs := "{" + strings.TrimRight(sub, " ,-")
			if a.validateJson(rs) {
				return rs
			} else {
				return "Sai Json: " + rs
			}
		} else {
			return ""
		}
	}
	return ""
}

func (a *App) validateJson(line string) bool {
	return json.Unmarshal([]byte(line), new(interface{})) == nil
}

// -----------------------------------------------

// ParseMessage parses a single ISO8583 message
func (a *App) ParseMessage(rawMessage string) (*models.ParsedMessage, error) {
	return parser.ParseSimpleMessage(rawMessage)
}

// ParseMultipleMessages parses multiple ISO8583 messages
func (a *App) ParseMultipleMessages(rawMessages []string) ([]*models.ParsedMessage, error) {
	return parser.ParseMultipleMessages(rawMessages)
}
