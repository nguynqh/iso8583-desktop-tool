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
	templatePath := "internal/templates/iso8583.json"
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

// ParseMessage parses a single ISO8583 message with detailed logging
func (a *App) ParseMessage(rawMessage string) (*models.ParsedMessage, error) {
	fmt.Printf("\n🔍 Single message parse requested\n")
	return a.parser.ParseSimpleMessage(rawMessage)
}

// ParseMultipleMessages parses multiple ISO8583 messages
func (a *App) ParseMultipleMessages(rawMessages []string) ([]*models.ParsedMessage, error) {
	fmt.Printf("\n🔍 Multiple message parse requested (%d messages)\n", len(rawMessages))
	return a.parser.ParseMultipleMessages(rawMessages)
}

// GetSampleMessages returns realistic sample messages for testing
func (a *App) GetSampleMessages() []string {
	return []string{
		// Authorization Request
		"MTI=0100,F2:4532123456789012,F3:000000,F4:000000010000,F7:0612143055,F11:123456,F12:143055,F13:0612,F14:2512,F18:6011,F22:901,F25:00,F37:123456789012,F41:TERM0001,F42:MERCHANT123456,F43:Test Merchant Location,F49:840",

		// Authorization Response
		"MTI=0110,F2:4532123456789012,F3:000000,F4:000000010000,F7:0612143055,F11:123456,F12:143055,F13:0612,F37:123456789012,F38:123456,F39:00,F41:TERM0001,F42:MERCHANT123456,F49:840",

		// Financial Request with errors (for validation testing)
		"MTI=0200,F2:970403******2051,F3:502010,F4:000002706000,F7:0425085750,F11:123125,F12:085750,F13:0425,F14:2801,F15:0425,F18:6011,F22:801,F25:02,F32:426088,F33:211200,F35:9704030148952051D28016010000076599999,F37:511530199124,F41:00005001,F42:000000099999999,F43:5001-ATM LAU13 VN,F49:704,F52:eY匀d󑠵3:2000000000000000,F62:9704060129837293",

		// Financial Response
		"MTI=0210,F2:970403******2051,F3:502010,F4:000002706000,F7:0425085750,F11:123125,F12:085750,F13:0425,F18:6011,F28:000000000,F32:426088,F37:511530199124,F38:864491,F39:00,F41:00005001,F42:000000099999999,F49:704,F57:NGUYEN NGOC DUC",
	}
}

// GetTemplateName returns current template name
func (a *App) GetTemplateName() string {
	return a.templateLoader.GetTemplateName()
}

// GetTemplateVersion returns current template version
func (a *App) GetTemplateVersion() string {
	return a.templateLoader.GetTemplateVersion()
}

// GetTemplateStats returns template statistics
func (a *App) GetTemplateStats() map[string]interface{} {
	allFields := a.templateLoader.GetAllFields()

	stats := map[string]interface{}{
		"totalFields": len(allFields),
		"fieldTypes":  make(map[string]int),
	}

	fieldTypes := stats["fieldTypes"].(map[string]int)
	for _, field := range allFields {
		fieldTypes[field.FieldType]++
	}

	return stats
}

// LoadTemplate loads a new template file
func (a *App) LoadTemplate(templatePath string) error {
	return a.templateLoader.LoadTemplate(templatePath)
}
