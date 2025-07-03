package parser

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"iso8583-desktop-tool/internal/loader"
	"iso8583-desktop-tool/internal/models"
)

// ISO8583Parser handles parsing of ISO8583 messages with advanced validation
type ISO8583Parser struct {
	templateLoader *loader.TemplateLoader
	// messageValidator *validator.MessageValidator
}

func NewISO8583Parser(templateLoader *loader.TemplateLoader) *ISO8583Parser {
	return &ISO8583Parser{
		templateLoader: templateLoader,
		// messageValidator: validator.NewMessageValidator(templateLoader),
	}
}

// ParseMessage auto-detects format and parses message
func (p *ISO8583Parser) ParseMessage(raw string) (*models.ParsedMessage, error) {
	fmt.Printf("\n=== PARSING ISO8583 MESSAGE ===\n")
	fmt.Printf("Raw Input: %s\n", raw)

	if raw == "" {
		return nil, fmt.Errorf("empty message -- ParseMessage phase")
	}

	if strings.HasPrefix(raw, "MTI=") {
		fmt.Printf("===================Parse Simple MTI-based message format\n")
		return p.ParseSimple(raw)
	}

	if strings.HasPrefix(raw, `{"mti`) {
		fmt.Printf("===================Parse Json MTI-based message format\n")
		return p.ParseJSON(raw)
	}

	return nil, fmt.Errorf("unsupported message format: %s", raw)

}

// Simple -----------------------------

// parseSimple parses "MTI=0200,F2:value,F3:value..." format
func (p *ISO8583Parser) ParseSimple(raw string) (*models.ParsedMessage, error) {
	parts := strings.Split(raw, ",")

	msg := &models.ParsedMessage{
		Format:   "Simple",
		Fields:   []models.ParsedField{},
		ParsedAt: time.Now().UTC().Format("2006-01-02 15:04:05"),
	}

	for _, part := range parts {
		part = strings.TrimSpace(part)

		if strings.HasPrefix(part, "MTI=") {
			msg.MTI = strings.TrimPrefix(part, "MTI=")
		} else if strings.HasPrefix(part, "F") && strings.Contains(part, ":") {
			field := p.parseField(part)
			if field != nil {
				msg.Fields = append(msg.Fields, *field)
			}
		}
	}

	if msg.MTI == "" {
		return nil, fmt.Errorf("MTI (Message Type Indicator) not found in message")
	}

	p.validate(msg)

	fmt.Printf("Parsing completed: %d fields, %d errors\n", len(msg.Fields), msg.ErrorCount)
	return msg, nil
}

// parseField parses "F2:value" format
func (p *ISO8583Parser) parseField(part string) *models.ParsedField {
	fieldParts := strings.SplitN(part, ":", 2)
	if len(fieldParts) != 2 {
		fmt.Printf("Invalid field format: %s\n", part)
		return nil
	}

	idStr := strings.TrimPrefix(fieldParts[0], "F")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		fmt.Printf("Invalid field ID: %s\n", idStr)
		return nil
	}

	return p.createField(id, fieldParts[1])
}

// createField creates a ParsedField with template information
func (p *ISO8583Parser) createField(id int, value string) *models.ParsedField {
	field := &models.ParsedField{
		ID:           id,
		Value:        value,
		ActualLength: len(value),
		IsValid:      true,
	}

	if fieldDefinition, exists := p.templateLoader.GetFieldDefinition(id); exists {
		field.Name = fieldDefinition.FieldDescription
		field.FieldType = fieldDefinition.FieldType
		field.Pattern = fieldDefinition.FieldPattern

		if maxLen, err := strconv.Atoi(fieldDefinition.FieldLength); err == nil {
			field.MaxLength = maxLen
		}
	} else {
		field.Name = fmt.Sprintf("Field %d", id)
		fmt.Printf("No template definition found for field %d\n", id)
	}

	return field
}

// JSON -----------------------------

// parseJSON parses {"mti":"0200","listField":{"2":"value"}} format
func (p *ISO8583Parser) ParseJSON(raw string) (*models.ParsedMessage, error) {
	var jsonMsg models.JSONMessage
	if err := json.Unmarshal([]byte(raw), &jsonMsg); err != nil {
		return nil, fmt.Errorf("invalid JSON message: %w", err)
	}

	fmt.Printf("  MTI: %s\n", jsonMsg.MTI)
	fmt.Printf("  Bitmap: %s\n", jsonMsg.Bitmap)
	fmt.Printf("  Fields in listField: %d\n", len(jsonMsg.ListField))

	msg := &models.ParsedMessage{
		MTI:      jsonMsg.MTI,
		Format:   "JSON",
		Fields:   []models.ParsedField{},
		ParsedAt: time.Now().UTC().Format("2006-01-02 15:04:05"),
	}

	// Verify Bitmap presence
	if jsonMsg.Bitmap != "" {
		bitmap, err := p.parseBitmap(jsonMsg.Bitmap)
		if err != nil {
			fmt.Printf("invalid bitmap: %v", err)
			bitmap = &models.BitmapInfo{
				HexValue: jsonMsg.Bitmap,
				IsValid:  false,
				Error:    err.Error(),
			}
		} else {
			fmt.Printf("Bitmap parsed successfully: %s\n", bitmap.HexValue)
		}
		msg.Bitmap = bitmap
	}

	// Parse fields from listField
	for fieldID, value := range jsonMsg.ListField {
		field := p.createFieldFromJSON(fieldID, value, msg.Bitmap)
		if field != nil {
			fmt.Printf("  Field %s: %s (Bitmap: %t)\n", fieldID, value, field.IsPresentInBitmap)
			msg.Fields = append(msg.Fields, *field)
		}
	}

	// Check Bitmap consistency
	if msg.Bitmap != nil && !msg.Bitmap.IsValid {
		p.checkBitmapConsistency(msg)
	}

	// Validate the message
	p.validate(msg)

	fmt.Printf("Parsing completed: %d fields, %d errors\n", len(msg.Fields), msg.ErrorCount)
	return msg, nil
}

func (p *ISO8583Parser) parseBitmap(bitmapHex string) (*models.BitmapInfo, error) {
	// validate hex format
	if len(bitmapHex) != 16 {
		return nil, fmt.Errorf("invalid bitmap length: %s", bitmapHex)
	}

	// Convert hex to bytes
	bitmapBytes, err := hex.DecodeString(bitmapHex)
	if err != nil {
		return nil, fmt.Errorf("failed to decode bitmap hex: %w", err)
	}

	// Convert bytes to binary string
	bitmapBinary := ""
	for _, b := range bitmapBytes {
		bitmapBinary += fmt.Sprintf("%08b", b)
	}

	fmt.Printf(" Binary Bitmap: %s\n", bitmapBinary)

	// Find present fields
	presentFields := []int{}
	for i, bit := range bitmapBinary {
		if bit == '1' {
			fieldID := i + 1 // Fields are 1-indexed
			presentFields = append(presentFields, fieldID)
		}
	}

	return &models.BitmapInfo{
		HexValue:      bitmapHex,
		BinaryValue:   bitmapBinary,
		PresentFields: presentFields,
		IsValid:       true,
	}, nil
}

// createFieldFromJSON creates a ParsedField from JSON data
func (p *ISO8583Parser) createFieldFromJSON(fieldIDStr, value string, bitmap *models.BitmapInfo) *models.ParsedField {
	id, err := strconv.Atoi(fieldIDStr)
	if err != nil {
		return nil
	}

	field := p.createField(id, value)

	//
	if bitmap != nil && bitmap.IsValid {
		field.IsPresentInBitmap = false
		for _, presentID := range bitmap.PresentFields {
			if presentID == id {
				field.IsPresentInBitmap = true
				break
			}
		}
	}

	return field
}

// checkBitmapConsistency checks if all fields in the bitmap are present in the message
func (p *ISO8583Parser) checkBitmapConsistency(msg *models.ParsedMessage) {
	listFieldMap := make(map[int]bool)
	for _, files := range msg.Fields {
		listFieldMap[files.ID] = true
	}

	var missingFromList []int
	for _, fieldID := range msg.Bitmap.PresentFields {
		if !listFieldMap[fieldID] {
			missingFromList = append(missingFromList, fieldID)
		}
	}

	var missingFromBitmap []int
	for _, field := range msg.Fields {
		if !field.IsPresentInBitmap {
			missingFromBitmap = append(missingFromBitmap, field.ID)
		}
	}

	if len(missingFromList) > 0 {
		fmt.Printf("  ⚠️  Fields in bitmap but missing from listField: %v\n", missingFromList)
	}

	if len(missingFromBitmap) > 0 {
		fmt.Printf("  ⚠️  Fields in listField but missing from bitmap: %v\n", missingFromBitmap)
		// Add warnings to these fields
		for i := range msg.Fields {
			field := &msg.Fields[i]
			if !field.IsPresentInBitmap {
				if field.Error == "" {
					field.Error = "Not indicated in bitmap"
				} else {
					field.Error += " (Also: Not in bitmap)"
				}
			}
		}
	}

	if len(missingFromList) == 0 && len(missingFromBitmap) == 0 {
		fmt.Printf("  ✅ Bitmap consistency check passed\n")
	}
}

// --------- Validation -----------------------------
func (p *ISO8583Parser) validate(msg *models.ParsedMessage) {
	errorCount := 0

	if msg.Bitmap != nil && !msg.Bitmap.IsValid {
		errorCount++
	}

	for i := range msg.Fields {
		field := &msg.Fields[i]

		// Get template definition
		fieldDef, hasTemplate := p.templateLoader.GetFieldDefinition(field.ID)
		if !hasTemplate {
			continue
		}

		// Length validation based on FieldType
		switch fieldDef.FieldType {
		case "Fixed":
			expectedLen, err := strconv.Atoi(fieldDef.FieldLength)
			fmt.Printf("Expected length for %s: %d\n", field.Name, expectedLen)
			if field.Value == "MASKED" {
				continue
			} else if err == nil && field.ActualLength != expectedLen {
				field.IsValid = false
				field.Error = fmt.Sprintf("Trường mang kiểu Fixed bắt buộc phải %d ký tự, nhưng có %d", expectedLen, field.ActualLength)
				errorCount++
				fmt.Printf("Cộng error của: " + field.Name + " - " + field.Error + "\n")
			}

		case "LLVAR", "LLLVAR":
			maxLen, err := strconv.Atoi(fieldDef.FieldLength)
			if err == nil && field.ActualLength > maxLen {
				field.IsValid = false
				field.Error = fmt.Sprintf("Too long: %d/%d chars", field.ActualLength, maxLen)
				errorCount++
			}

		case "Bitmap":
			if field.ActualLength != 16 {
				field.IsValid = false
				field.Error = fmt.Sprintf("Bitmap must be 16 hex chars, got %d", field.ActualLength)
				errorCount++
			}
			if !p.isHex(field.Value) {
				field.IsValid = false
				field.Error = "Bitmap must contain only hex characters (0-9, A-F)"
				errorCount++
			}
		}

		// Pattern validation
		if fieldDef.FieldPattern != "" {
			if !p.validatePattern(field.Value, fieldDef.FieldPattern) {
				field.IsValid = false
				if field.Error == "" {
					field.Error = fmt.Sprintf("Pattern mismatch: expected %s", fieldDef.FieldPattern)
				} else {
					field.Error += fmt.Sprintf(" (Pattern: %s)", fieldDef.FieldPattern)
				}
				errorCount++
			}
		}

		// Specific field validation
		p.validateSpecificField(field, &errorCount)
		// print errorCounte
		fmt.Printf("Cộng error của: " + field.Name + " - " + field.Error + "\n")
	}

	msg.ErrorCount = errorCount
	msg.IsValid = errorCount == 0

	fmt.Printf("Validation completed: %d errors found\n", errorCount)
}

// validatePattern validates field against pattern (unchanged)
func (p *ISO8583Parser) validatePattern(value, pattern string) bool {
	switch pattern {
	case "{6}-{4}-{4}-{4}":
		return len(value) >= 13 && len(value) <= 19
	default:
		return true
	}
}

// validateSpecificField applies field-specific validation rules (unchanged)
func (p *ISO8583Parser) validateSpecificField(field *models.ParsedField, errorCount *int) {
	switch field.ID {
	case 0:
		if field.ActualLength != 4 {
			field.IsValid = false
			field.Error = "MTI must be 4 digits"
			(*errorCount)++
		}
		if !p.isNumeric(field.Value) {
			field.IsValid = false
			field.Error = "MTI must be numeric"
			(*errorCount)++
		}

	case 2:
		if field.ActualLength < 13 || field.ActualLength > 19 {
			field.IsValid = false
			field.Error = "PAN must be 13-19 characters"
			(*errorCount)++
		}

	case 3:
		if field.ActualLength != 6 {
			field.IsValid = false
			field.Error = "Processing code must be 6 digits"
			(*errorCount)++
		}
		if !p.isNumeric(field.Value) {
			field.IsValid = false
			field.Error = "Processing code must be numeric"
			(*errorCount)++
		}

	case 11:
		if field.ActualLength != 6 {
			field.IsValid = false
			field.Error = "STAN must be 6 digits"
			(*errorCount)++
		}
		if !p.isNumeric(field.Value) {
			field.IsValid = false
			field.Error = "STAN must be numeric"
			(*errorCount)++
		}

	case 39:
		if field.ActualLength != 2 {
			field.IsValid = false
			field.Error = "Response code must be 2 characters"
			(*errorCount)++
		}
	}

}

// Helper functions
func (p *ISO8583Parser) isNumeric(s string) bool {
	for _, char := range s {
		if char < '0' || char > '9' {
			return false
		}
	}
	return len(s) > 0
}

func (p *ISO8583Parser) isHex(s string) bool {
	for _, char := range s {
		if !((char >= '0' && char <= '9') ||
			(char >= 'A' && char <= 'F') ||
			(char >= 'a' && char <= 'f')) {
			return false
		}
	}
	return len(s) > 0
}
