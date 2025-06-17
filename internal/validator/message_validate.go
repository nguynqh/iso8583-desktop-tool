/*
package validator

import (

	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"iso8583-desktop-tool/internal/loader"
	"iso8583-desktop-tool/internal/models"

)

// MessageValidator provides comprehensive message validation

	type MessageValidator struct {
		templateLoader *loader.TemplateLoader
	}

	func NewMessageValidator(templateLoader *loader.TemplateLoader) *MessageValidator {
		return &MessageValidator{
			templateLoader: templateLoader,
		}
	}

// ValidateMessage performs comprehensive message validation with detailed logging

	func (mv *MessageValidator) ValidateMessage(message *models.ParsedMessage) {
		fmt.Printf("\n=== MESSAGE VALIDATION ===\n")

		// Initialize validation counters
		errorCount := 0
		warningCount := 0
		validFields := 0
		unknownFields := []int{}

		// Validate each field
		fmt.Printf("Validating %d fields...\n", len(message.Fields))
		for i := range message.Fields {
			field := &message.Fields[i]
			fmt.Printf("  Validating Field %d (%s)...\n", field.ID, field.Name)

			mv.validateField(field)

			if field.IsValid {
				validFields++
				fmt.Printf("    ✅ Valid\n")
			} else {
				fmt.Printf("    ❌ Invalid (%d errors, %d warnings)\n", len(field.Errors), len(field.Warnings))
			}

			errorCount += len(field.Errors)
			warningCount += len(field.Warnings)

			// Check if field is unknown (not in template)
			if _, exists := mv.templateLoader.GetFieldDefinition(field.ID); !exists {
				unknownFields = append(unknownFields, field.ID)
			}
		}

		// Calculate validation metrics
		totalFields := len(message.Fields)
		fieldsCoverage := float64(totalFields-len(unknownFields)) / float64(totalFields) * 100
		validationScore := float64(validFields) / float64(totalFields) * 100

		// Set message validation status
		message.IsValid = errorCount == 0
		message.ValidationSummary = models.ValidationSummary{
			TotalFields:     totalFields,
			ValidFields:     validFields,
			ErrorCount:      errorCount,
			WarningCount:    warningCount,
			FieldsCoverage:  fieldsCoverage,
			ValidationScore: validationScore,
			UnknownFields:   unknownFields,
		}

		fmt.Printf("\nValidation Summary:\n")
		fmt.Printf("  Total Fields: %d\n", totalFields)
		fmt.Printf("  Valid Fields: %d\n", validFields)
		fmt.Printf("  Errors: %d\n", errorCount)
		fmt.Printf("  Warnings: %d\n", warningCount)
		fmt.Printf("  Fields Coverage: %.1f%%\n", fieldsCoverage)
		fmt.Printf("  Validation Score: %.1f%%\n", validationScore)
		fmt.Printf("  Message Valid: %t\n", message.IsValid)
	}

// validateField performs comprehensive field validation

	func (mv *MessageValidator) validateField(field *models.ParsedField) {
		field.Errors = []models.ValidationError{}
		field.Warnings = []models.ValidationError{}
		field.IsValid = true

		// Get field definition from template
		fieldDef, hasDefinition := mv.templateLoader.GetFieldDefinition(field.ID)
		if !hasDefinition {
			mv.addWarning(field, "template", "No template definition", "None",
				fmt.Sprintf("Field %d is not defined in the template", field.ID), "Template Coverage Check")
			return
		}

		// 1. Length Validation
		mv.validateFieldLength(field, fieldDef)

		// 2. Type Validation
		mv.validateFieldType(field, fieldDef)

		// 3. Pattern Validation
		mv.validateFieldPattern(field, fieldDef)

		// 4. Specific Field Validation
		mv.validateSpecificField(field)
	}

// validateFieldLength checks field length constraints

	func (mv *MessageValidator) validateFieldLength(field *models.ParsedField, fieldDef *loader.FieldDefinition) {
		fmt.Printf("    → Length validation...\n")

		maxLength, err := strconv.Atoi(fieldDef.FieldLength)
		if err != nil {
			fmt.Printf("      Invalid max length in template: %s\n", fieldDef.FieldLength)
			return
		}

		actualLength := len(field.Value)

		switch fieldDef.FieldType {
		case "Fixed":
			// Fixed length fields must match exactly
			if actualLength != maxLength {
				mv.addError(field, "length", fmt.Sprintf("Exactly %d characters", maxLength),
					fmt.Sprintf("%d characters", actualLength),
					fmt.Sprintf("Fixed field must be exactly %d characters, got %d", maxLength, actualLength),
					"Fixed Length Validation")
			} else {
				fmt.Printf("      ✅ Fixed length correct: %d\n", actualLength)
			}

		case "LLVAR", "LLLVAR":
			// Variable length fields have maximum constraints
			if actualLength > maxLength {
				mv.addError(field, "length", fmt.Sprintf("Max %d characters", maxLength),
					fmt.Sprintf("%d characters", actualLength),
					fmt.Sprintf("Variable field exceeds maximum length of %d characters", maxLength),
					"Variable Length Validation")
			} else {
				fmt.Printf("      ✅ Variable length within limits: %d/%d\n", actualLength, maxLength)
			}

		default:
			fmt.Printf("      ⚠️  Unknown field type: %s\n", fieldDef.FieldType)
		}
	}

// validateFieldType checks field data type constraints

	func (mv *MessageValidator) validateFieldType(field *models.ParsedField, fieldDef *loader.FieldDefinition) {
		fmt.Printf("    → Type validation...\n")

		value := field.Value

		// Check based on field type and common patterns
		switch {
		case field.ID == 1: // Bitmap - should be hex
			if !mv.isHexadecimal(value) {
				mv.addError(field, "type", "Hexadecimal", "Non-hex characters",
					"Bitmap field should contain only hexadecimal characters",
					"Bitmap Type Validation")
			}

		case strings.Contains(strings.ToLower(fieldDef.FieldDescription), "amount"):
			// Amount fields should be numeric
			if !mv.isNumeric(value) {
				mv.addError(field, "type", "Numeric", "Contains non-numeric",
					"Amount fields should contain only numeric characters",
					"Amount Type Validation")
			}

		case strings.Contains(strings.ToLower(fieldDef.FieldDescription), "date"):
			// Date fields should be numeric
			if !mv.isNumeric(value) {
				mv.addError(field, "type", "Numeric date", "Contains non-numeric",
					"Date fields should contain only numeric characters",
					"Date Type Validation")
			}

		case strings.Contains(strings.ToLower(fieldDef.FieldDescription), "time"):
			// Time fields should be numeric
			if !mv.isNumeric(value) {
				mv.addError(field, "type", "Numeric time", "Contains non-numeric",
					"Time fields should contain only numeric characters",
					"Time Type Validation")
			}
		}

		// Check for control characters in text fields
		if mv.hasControlCharacters(value) {
			mv.addWarning(field, "format", "Printable characters", "Contains control chars",
				"Field contains non-printable control characters",
				"Control Character Check")
		}
	}

// validateFieldPattern checks field pattern constraints

	func (mv *MessageValidator) validateFieldPattern(field *models.ParsedField, fieldDef *loader.FieldDefinition) {
		if fieldDef.FieldPattern == "" {
			return // No pattern to validate
		}

		fmt.Printf("    → Pattern validation: %s...\n", fieldDef.FieldPattern)

		switch fieldDef.FieldPattern {
		case "MMDDhhmmss":
			mv.validateDateTimePattern(field, "MMDDhhmmss")
		case "hhmmss":
			mv.validateTimePattern(field)
		case "MMDD":
			mv.validateDatePattern(field, "MMDD")
		case "YYMM":
			mv.validateDatePattern(field, "YYMM")
		case "{6}-{4}-{4}-{4}":
			mv.validatePANPattern(field)
		}
	}

// validateSpecificField applies field-specific validation rules

	func (mv *MessageValidator) validateSpecificField(field *models.ParsedField) {
		fmt.Printf("    → Specific field validation...\n")

		switch field.ID {
		case 2: // PAN
			mv.validatePAN(field)
		case 3: // Processing Code
			mv.validateProcessingCode(field)
		case 39: // Response Code
			mv.validateResponseCode(field)
		case 11: // STAN
			mv.validateSTAN(field)
		}
	}

// Specific field validators

	func (mv *MessageValidator) validatePAN(field *models.ParsedField) {
		pan := field.Value

		// Length check
		if len(pan) < 13 || len(pan) > 19 {
			mv.addError(field, "format", "13-19 digits", fmt.Sprintf("%d characters", len(pan)),
				"PAN should be between 13-19 digits", "PAN Length Validation")
			return
		}

		// Masking pattern check
		if strings.Contains(pan, "*") {
			maskPattern := regexp.MustCompile(`^\d{6}\*+\d{4}$`)
			if !maskPattern.MatchString(pan) {
				mv.addWarning(field, "format", "XXXXXX****XXXX", pan,
					"PAN masking doesn't follow standard 6-4 pattern", "PAN Masking Validation")
			} else {
				fmt.Printf("      ✅ PAN masking pattern valid\n")
			}
		}
	}

	func (mv *MessageValidator) validateProcessingCode(field *models.ParsedField) {
		if len(field.Value) != 6 {
			mv.addError(field, "format", "6 digits", fmt.Sprintf("%d characters", len(field.Value)),
				"Processing code must be exactly 6 digits", "Processing Code Length")
		}

		if !mv.isNumeric(field.Value) {
			mv.addError(field, "format", "Numeric", "Contains non-numeric",
				"Processing code must be numeric", "Processing Code Format")
		}
	}

	func (mv *MessageValidator) validateResponseCode(field *models.ParsedField) {
		if len(field.Value) != 2 {
			mv.addError(field, "format", "2 characters", fmt.Sprintf("%d characters", len(field.Value)),
				"Response code must be exactly 2 characters", "Response Code Length")
			return
		}

		// Check against common response codes
		commonCodes := map[string]string{
			"00": "Approved",
			"01": "Refer to card issuer",
			"03": "Invalid merchant",
			"04": "Pick up card",
			"05": "Do not honor",
			"12": "Invalid transaction",
			"13": "Invalid amount",
			"14": "Invalid card number",
			"30": "Format error",
			"51": "Insufficient funds",
			"54": "Expired card",
			"61": "Exceeds withdrawal amount limit",
			"62": "Restricted card",
			"65": "Exceeds withdrawal frequency limit",
			"91": "Issuer unavailable",
		}

		if description, exists := commonCodes[field.Value]; exists {
			fmt.Printf("      ✅ Known response code: %s (%s)\n", field.Value, description)
		} else {
			mv.addWarning(field, "format", "Standard response code", field.Value,
				fmt.Sprintf("Response code '%s' is not commonly used", field.Value),
				"Response Code Recognition")
		}
	}

	func (mv *MessageValidator) validateSTAN(field *models.ParsedField) {
		if len(field.Value) != 6 {
			mv.addError(field, "format", "6 digits", fmt.Sprintf("%d characters", len(field.Value)),
				"STAN must be exactly 6 digits", "STAN Length Validation")
		}

		if !mv.isNumeric(field.Value) {
			mv.addError(field, "format", "Numeric", "Contains non-numeric",
				"STAN must be numeric", "STAN Format Validation")
		}
	}

// Pattern validators

	func (mv *MessageValidator) validateDateTimePattern(field *models.ParsedField, pattern string) {
		if len(field.Value) != len(pattern) {
			mv.addError(field, "pattern", pattern, field.Value,
				fmt.Sprintf("DateTime pattern %s requires %d characters", pattern, len(pattern)),
				"DateTime Pattern Validation")
			return
		}

		if !mv.isNumeric(field.Value) {
			mv.addError(field, "pattern", "Numeric datetime", "Contains non-numeric",
				"DateTime should be numeric", "DateTime Format Validation")
		}
	}

	func (mv *MessageValidator) validateTimePattern(field *models.ParsedField) {
		if len(field.Value) != 6 {
			mv.addError(field, "pattern", "hhmmss (6 digits)", field.Value,
				"Time pattern requires 6 digits", "Time Pattern Validation")
			return
		}

		if !mv.isNumeric(field.Value) {
			mv.addError(field, "pattern", "Numeric time", "Contains non-numeric",
				"Time should be numeric", "Time Format Validation")
		}
	}

	func (mv *MessageValidator) validateDatePattern(field *models.ParsedField, pattern string) {
		expectedLen := len(pattern)
		if len(field.Value) != expectedLen {
			mv.addError(field, "pattern", fmt.Sprintf("%s (%d digits)", pattern, expectedLen), field.Value,
				fmt.Sprintf("Date pattern %s requires %d digits", pattern, expectedLen),
				"Date Pattern Validation")
			return
		}

		if !mv.isNumeric(field.Value) {
			mv.addError(field, "pattern", "Numeric date", "Contains non-numeric",
				"Date should be numeric", "Date Format Validation")
		}
	}

	func (mv *MessageValidator) validatePANPattern(field *models.ParsedField) {
		// This is a simplified PAN pattern validation
		// Real implementation would be more sophisticated
		if len(field.Value) < 13 {
			mv.addError(field, "pattern", "Minimum 13 characters", fmt.Sprintf("%d characters", len(field.Value)),
				"PAN pattern requires minimum 13 characters", "PAN Pattern Validation")
		}
	}

// Helper functions

	func (mv *MessageValidator) isNumeric(s string) bool {
		for _, r := range s {
			if r < '0' || r > '9' {
				return false
			}
		}
		return len(s) > 0
	}

	func (mv *MessageValidator) isHexadecimal(s string) bool {
		for _, r := range s {
			if !((r >= '0' && r <= '9') || (r >= 'A' && r <= 'F') || (r >= 'a' && r <= 'f')) {
				return false
			}
		}
		return len(s) > 0
	}

	func (mv *MessageValidator) hasControlCharacters(s string) bool {
		for _, r := range s {
			if unicode.IsControl(r) && r != '\r' && r != '\n' && r != '\t' {
				return true
			}
		}
		return false
	}

	func (mv *MessageValidator) addError(field *models.ParsedField, errorType, expected, actual, message, rule string) {
		field.IsValid = false
		field.Errors = append(field.Errors, models.ValidationError{
			FieldID:     field.ID,
			FieldName:   field.Name,
			ErrorType:   errorType,
			Expected:    expected,
			Actual:      actual,
			Severity:    "error",
			Message:     message,
			RuleApplied: rule,
		})
		fmt.Printf("      ❌ ERROR: %s\n", message)
	}

	func (mv *MessageValidator) addWarning(field *models.ParsedField, errorType, expected, actual, message, rule string) {
		field.Warnings = append(field.Warnings, models.ValidationError{
			FieldID:     field.ID,
			FieldName:   field.Name,
			ErrorType:   errorType,
			Expected:    expected,
			Actual:      actual,
			Severity:    "warning",
			Message:     message,
			RuleApplied: rule,
		})
		fmt.Printf("      ⚠️  WARNING: %s\n", message)
	}
*/
package validator
