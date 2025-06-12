package parser

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"iso8583-desktop-tool/internal/loader"
	"iso8583-desktop-tool/internal/models"
	"iso8583-desktop-tool/internal/validator"
)

// ISO8583Parser handles parsing of ISO8583 messages with advanced validation
type ISO8583Parser struct {
	templateLoader   *loader.TemplateLoader
	messageValidator *validator.MessageValidator
}

func NewISO8583Parser(templateLoader *loader.TemplateLoader) *ISO8583Parser {
	return &ISO8583Parser{
		templateLoader:   templateLoader,
		messageValidator: validator.NewMessageValidator(templateLoader),
	}
}

// ParseSimpleMessage parses messages in format: "MTI=0200,F2:value,F3:value..."
func (p *ISO8583Parser) ParseSimpleMessage(raw string) (*models.ParsedMessage, error) {
	fmt.Printf("\n=== PARSING ISO8583 MESSAGE ===\n")
	fmt.Printf("Raw Input: %s\n", raw)

	if raw == "" {
		return nil, fmt.Errorf("empty message cannot be parsed")
	}

	// Step 1: Split message into components
	fmt.Printf("\nStep 1: Splitting message into components...\n")
	parts := strings.Split(raw, ",")
	fmt.Printf("Found %d components: %v\n", len(parts), parts)

	if len(parts) == 0 {
		return nil, fmt.Errorf("invalid message format - no components found")
	}

	// Step 2: Initialize message structure
	message := &models.ParsedMessage{
		Fields:        []models.ParsedField{},
		TemplateName:  p.templateLoader.GetTemplateName(),
		ParsedAt:      time.Now().UTC().Format("2006-01-02 15:04:05"),
		ParsingMethod: "Simple Format Parser",
	}

	fmt.Printf("\nStep 2: Processing each component...\n")

	// Step 3: Process each component
	for i, part := range parts {
		part = strings.TrimSpace(part)
		fmt.Printf("  Component %d: '%s'\n", i+1, part)

		if strings.HasPrefix(part, "MTI=") {
			// Parse MTI (Message Type Indicator)
			mti := strings.TrimPrefix(part, "MTI=")
			message.MTI = mti
			message.MTIDescription = p.interpretMTI(mti)
			fmt.Printf("    → MTI identified: %s (%s)\n", mti, message.MTIDescription)

		} else if strings.HasPrefix(part, "F") && strings.Contains(part, ":") {
			// Parse field in format F<number>:<value>
			fmt.Printf("    → Processing field component...\n")
			field, err := p.parseFieldComponent(part)
			if err != nil {
				fmt.Printf("    → Error parsing field: %v\n", err)
				continue
			}

			fmt.Printf("    → Field parsed successfully: F%d = %s\n", field.ID, field.Value)
			message.Fields = append(message.Fields, *field)
		} else {
			fmt.Printf("    → Unknown component format, skipping\n")
		}
	}

	// Step 4: Validate MTI presence
	if message.MTI == "" {
		return nil, fmt.Errorf("MTI (Message Type Indicator) not found in message")
	}

	// Step 5: Set basic message properties
	message.FieldCount = len(message.Fields)
	fmt.Printf("\nStep 3: Message parsing completed\n")
	fmt.Printf("  MTI: %s\n", message.MTI)
	fmt.Printf("  Fields found: %d\n", message.FieldCount)

	// Step 6: Apply validation rules
	fmt.Printf("\nStep 4: Applying validation rules...\n")
	p.messageValidator.ValidateMessage(message)

	fmt.Printf("  Validation completed:\n")
	fmt.Printf("    - Valid fields: %d/%d\n", message.ValidationSummary.ValidFields, message.ValidationSummary.TotalFields)
	fmt.Printf("    - Errors: %d\n", message.ValidationSummary.ErrorCount)
	fmt.Printf("    - Warnings: %d\n", message.ValidationSummary.WarningCount)
	fmt.Printf("    - Overall valid: %t\n", message.IsValid)

	return message, nil
}

// parseFieldComponent parses individual field component like "F2:970403******2051"
func (p *ISO8583Parser) parseFieldComponent(component string) (*models.ParsedField, error) {
	// Split field component into ID and value
	fieldParts := strings.SplitN(component, ":", 2)
	if len(fieldParts) != 2 {
		return nil, fmt.Errorf("invalid field format: %s", component)
	}

	// Extract field ID
	idStr := strings.TrimPrefix(fieldParts[0], "F")
	fieldID, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, fmt.Errorf("invalid field ID: %s", idStr)
	}

	fieldValue := fieldParts[1]

	fmt.Printf("      - Field ID: %d\n", fieldID)
	fmt.Printf("      - Field Value: %s\n", fieldValue)

	// Create basic field structure
	field := &models.ParsedField{
		ID:           fieldID,
		Value:        fieldValue,
		ActualLength: len(fieldValue),
		ParseMethod:  "Simple Format",
	}

	// Enrich field with template information
	p.enrichFieldWithTemplate(field)

	return field, nil
}

// enrichFieldWithTemplate adds template-based information to field
func (p *ISO8583Parser) enrichFieldWithTemplate(field *models.ParsedField) {
	fmt.Printf("      - Looking up field %d in template...\n", field.ID)

	if fieldDef, exists := p.templateLoader.GetFieldDefinition(field.ID); exists {
		field.Name = fieldDef.FieldDescription
		field.Description = fieldDef.FieldDescription
		field.FieldType = fieldDef.FieldType
		field.Pattern = fieldDef.FieldPattern

		// Parse max length
		if maxLen, err := strconv.Atoi(fieldDef.FieldLength); err == nil {
			field.MaxLength = maxLen
		}

		fmt.Printf("      - Template found: %s (Type: %s, MaxLen: %d)\n",
			field.Name, field.FieldType, field.MaxLength)
	} else {
		field.Name = fmt.Sprintf("Field %d", field.ID)
		field.Description = "Unknown field - not defined in template"
		fmt.Printf("      - No template definition found\n")
	}
}

// interpretMTI provides human-readable MTI interpretation
func (p *ISO8583Parser) interpretMTI(mti string) string {
	if len(mti) != 4 {
		return "Invalid MTI format"
	}

	// MTI interpretation based on ISO8583 standard
	version := p.getMTIVersion(mti[0:1])
	class := p.getMTIClass(mti[1:2])
	function := p.getMTIFunction(mti[2:3])
	origin := p.getMTIOrigin(mti[3:4])

	return fmt.Sprintf("%s %s %s %s", version, class, function, origin)
}

func (p *ISO8583Parser) getMTIVersion(v string) string {
	switch v {
	case "0":
		return "ISO 8583-1:1987"
	case "1":
		return "ISO 8583-2:1993"
	case "2":
		return "ISO 8583-3:2003"
	default:
		return "Unknown Version"
	}
}

func (p *ISO8583Parser) getMTIClass(c string) string {
	switch c {
	case "1":
		return "Authorization"
	case "2":
		return "Financial"
	case "3":
		return "File Action"
	case "4":
		return "Reversal"
	case "5":
		return "Reconciliation"
	case "6":
		return "Administrative"
	case "7":
		return "Fee Collection"
	case "8":
		return "Network Management"
	case "9":
		return "Reserved"
	default:
		return "Unknown Class"
	}
}

func (p *ISO8583Parser) getMTIFunction(f string) string {
	switch f {
	case "0":
		return "Request"
	case "1":
		return "Request Response"
	case "2":
		return "Advice"
	case "3":
		return "Advice Response"
	case "4":
		return "Notification"
	case "5":
		return "Notification Acknowledgement"
	case "6":
		return "Instruction"
	case "7":
		return "Instruction Acknowledgement"
	case "8":
		return "Reserved"
	case "9":
		return "Reserved"
	default:
		return "Unknown Function"
	}
}

func (p *ISO8583Parser) getMTIOrigin(o string) string {
	switch o {
	case "0":
		return "Acquirer"
	case "1":
		return "Acquirer Repeat"
	case "2":
		return "Issuer"
	case "3":
		return "Issuer Repeat"
	case "4":
		return "Other"
	case "5":
		return "Other Repeat"
	default:
		return "Unknown Origin"
	}
}

// ParseMultipleMessages parses multiple messages with detailed logging
func (p *ISO8583Parser) ParseMultipleMessages(rawMessages []string) ([]*models.ParsedMessage, error) {
	fmt.Printf("\n=== PARSING MULTIPLE MESSAGES ===\n")
	fmt.Printf("Total messages to parse: %d\n", len(rawMessages))

	var results []*models.ParsedMessage
	var errors []string

	for i, raw := range rawMessages {
		fmt.Printf("\n--- Processing Message %d ---\n", i+1)

		parsed, err := p.ParseSimpleMessage(raw)
		if err != nil {
			errorMsg := fmt.Sprintf("Message %d: %v", i+1, err)
			errors = append(errors, errorMsg)
			fmt.Printf("ERROR: %s\n", errorMsg)
			continue
		}

		results = append(results, parsed)
		fmt.Printf("Message %d parsed successfully\n", i+1)
	}

	fmt.Printf("\n=== PARSING SUMMARY ===\n")
	fmt.Printf("Successfully parsed: %d/%d messages\n", len(results), len(rawMessages))
	if len(errors) > 0 {
		fmt.Printf("Errors encountered: %d\n", len(errors))
		for _, err := range errors {
			fmt.Printf("  - %s\n", err)
		}
	}

	if len(results) == 0 && len(errors) > 0 {
		return nil, fmt.Errorf("no valid messages found. Errors: %s", strings.Join(errors, "; "))
	}

	return results, nil
}
