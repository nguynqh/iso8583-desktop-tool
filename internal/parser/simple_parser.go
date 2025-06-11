package parser

import (
	"fmt"
	"strconv"
	"strings"

	"iso8583-desktop-tool/internal/models"
	"iso8583-desktop-tool/internal/templates"
)

type Parser struct {
	templateLoader *templates.TemplateLoader
}

func NewParser(templateLoader *templates.TemplateLoader) *Parser {
	return &Parser{
		templateLoader: templateLoader,
	}
}

// ParseSimpleMessage parses a message in format: "MTI=0200,F2:value,F3:value..."
func (p *Parser) ParseSimpleMessage(raw string) (*models.ParsedMessage, error) {
	if raw == "" {
		return nil, fmt.Errorf("empty message")
	}

	parts := strings.Split(raw, ",")
	if len(parts) == 0 {
		return nil, fmt.Errorf("invalid message format")
	}

	message := &models.ParsedMessage{
		Fields:       []models.ParsedField{},
		TemplateName: p.templateLoader.GetTemplateName(),
	}

	for _, part := range parts {
		part = strings.TrimSpace(part)

		if strings.HasPrefix(part, "MTI=") {
			message.MTI = strings.TrimPrefix(part, "MTI=")
		} else if strings.HasPrefix(part, "F") && strings.Contains(part, ":") {
			// Parse F2:value -> ID=2, Value=value
			fieldParts := strings.SplitN(part, ":", 2)
			if len(fieldParts) == 2 {
				idStr := strings.TrimPrefix(fieldParts[0], "F")
				id, err := strconv.Atoi(idStr)
				if err != nil {
					continue // Skip invalid field IDs
				}

				message.Fields = append(message.Fields, models.ParsedField{
					ID:    id,
					Name:  fmt.Sprintf("Field %d", id), // Tạm thời hardcode
					Value: fieldParts[1],
				})
			}
		}
	}

	if message.MTI == "" {
		return nil, fmt.Errorf("MTI not found")
	}

	return message, nil
}

// ParseMultipleMessages parses multiple messages
func ParseMultipleMessages(rawMessages []string) ([]*models.ParsedMessage, error) {
	var results []*models.ParsedMessage
	var errors []string

	for i, raw := range rawMessages {
		parsed, err := ParseSimpleMessage(raw)
		if err != nil {
			errors = append(errors, fmt.Sprintf("Message %d: %v", i+1, err))
			continue // Skip invalid messages for now
		}
		results = append(results, parsed)
	}

	if len(results) == 0 && len(errors) > 0 {
		return nil, fmt.Errorf("no valid messages found. Errors: %s", strings.Join(errors, "; "))
	}

	return results, nil
}
