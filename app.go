package main

import (
	// "context"
	"context"
	"fmt"
	"regexp"
	"strings"
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

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
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
			result = append(result, line)
		}
	}
	return result
}
