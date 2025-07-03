package main

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"iso8583-desktop-tool/internal/loader"
	"iso8583-desktop-tool/internal/models"
	"iso8583-desktop-tool/internal/parser"
)

// App struct
type App struct {
	ctx            context.Context
	parser         *parser.ISO8583Parser
	templateLoader *loader.TemplateLoader
}

type Message struct {
	Content     string `json:"content"`     // The actual message content
	Description string `json:"description"` // Description or additional info about the message
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx

	// Print application startup message
	fmt.Println("ISO8583 Desktop Tool is starting..........")

	// Initialize the template loader
	a.templateLoader = loader.NewTemplateLoader()

	// Load the ISO8583 default template
	templatePath := "internal/default_schema/iso8583.json"
	// templateName := filepath.Base(templatePath)
	fmt.Printf("Loading template from: %s\n", templatePath)

	if err := a.templateLoader.LoadTemplate(templatePath); err != nil {
		fmt.Printf("⚠️  Warning: Could not load template: %v\n", err)
		fmt.Println("Continuing with basic field names...")
	} else {
		fmt.Printf("✅ Successfully loaded template: %s\n", a.templateLoader.GetTemplateName())
		fmt.Printf("   Template contains %d field definitions\n", len(a.templateLoader.GetAllFields()))
	}

	// Initialize parser with template loader
	a.parser = parser.NewISO8583Parser(a.templateLoader)

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

// Filter------------------------------------------------

func (a *App) FilterLog(log string) []Message {
	// split line by regex
	lines := regexp.MustCompile(`\r?\n`).Split(log, -1)
	re := regexp.MustCompile(`(fr[^:]+:|to[^:]+:)`)
	var result []Message
	for _, line := range lines {
		line = strings.TrimSpace(line) // Loại bỏ dấu trắng và ký tự ẩn đầu/cuối
		if len(line) == 0 {
			continue
		}
		if (strings.Contains(line, "MTI") || strings.Contains(line, "mti")) && re.MatchString(line) {
			mess, des := a.getMessage(line)
			result = append(result, Message{Content: mess, Description: des})
		}
	}

	return result
}

func (a *App) getMessage(line string) (string, string) {
	re := regexp.MustCompile(`(\s*[\[,\\-]*\[[^\[\]]*\])+$`)
	re_des := regexp.MustCompile(`(fr[^:]+:|to[^:]+:)`)
	des := re_des.FindString(line)
	var mess string
	switch {
	case strings.Contains(line, "MTI"):
		idx := strings.Index(line, "MTI")
		if idx != -1 {
			sub := line[idx:]
			sub = re.ReplaceAllString(sub, "")
			mess = strings.TrimRight(sub, " ,-")
		}
	case strings.Contains(line, "mti"):
		idx := strings.Index(line, `"mti"`)
		if idx != -1 {
			sub := line[idx:]
			sub = re.ReplaceAllString(sub, "")
			rs := "{" + strings.TrimRight(sub, " ,-")
			if a.validateJson(rs) {
				mess = rs
			} else {
				mess = "Sai Json: " + rs
			}
		}
	}
	// fmt.Printf("Message: %s\n", mess)
	// fmt.Printf("Description: %s\n", des)
	return mess, des
}

func (a *App) validateJson(line string) bool {
	return json.Unmarshal([]byte(line), new(interface{})) == nil
}

// Parse and Validate-----------------------------------------------

func (a *App) ParseAndValidateMessage(message string) (*models.ParsedMessage, error) {
	fmt.Println("Parsing and validating message:", message)
	return a.parser.ParseMessage(message)
}

func (a *App) ParseSimpleMessage(message string) (*models.ParsedMessage, error) {
	return a.parser.ParseSimple(message)
}

func (a *App) ParseJsonMessage(message string) (*models.ParsedMessage, error) {
	return a.parser.ParseJSON(message)
}

// LoadTemplate loads a new template file
func (a *App) LoadTemplate(templatePath string) error {
	return a.templateLoader.LoadTemplate(templatePath)
}

// Interactive File --------------------------------------------------
func (a *App) ListTemplateFiles() ([]string, error) {
	rs, err := loader.ListTemplateFiles("internal/templates/")
	fmt.Printf("Found %d template files\n", len(rs))
	return rs, err
}
