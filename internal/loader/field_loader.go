package loader

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
)

// FieldDefinition represents ISO8583 field definition from JSON
type FieldDefinition struct {
	FieldNumber      string `json:"FieldNumber"`
	FieldType        string `json:"FieldType"`        // Fixed, LLVAR, LLLVAR, Bitmap
	FieldLength      string `json:"FieldLength"`      // Maximum length
	FieldPattern     string `json:"FieldPattern"`     // Pattern for validation
	FieldDescription string `json:"FieldDescription"` // Human readable description
}

// TemplateLoader manages ISO8583 field definitions
type TemplateLoader struct {
	fields map[string]FieldDefinition // fieldNumber -> definition
}

func NewTemplateLoader() *TemplateLoader {
	return &TemplateLoader{
		fields: make(map[string]FieldDefinition),
	}
}

// LoadTemplate loads field definitions from JSON array
func (tl *TemplateLoader) LoadTemplate(templatePath string) error {
	data, err := os.ReadFile(templatePath)
	if err != nil {
		return fmt.Errorf("failed to read template file: %w", err)
	}

	var fieldArray []FieldDefinition
	if err := json.Unmarshal(data, &fieldArray); err != nil {
		return fmt.Errorf("failed to parse template JSON: %w", err)
	}

	// Convert array to map for fast lookup
	tl.fields = make(map[string]FieldDefinition)
	for _, field := range fieldArray {
		tl.fields[field.FieldNumber] = field
	}

	return nil
}

// GetFieldDefinition returns field definition by field number
func (tl *TemplateLoader) GetFieldDefinition(fieldNumber int) (*FieldDefinition, bool) {
	fieldNumberStr := strconv.Itoa(fieldNumber)
	if fieldDef, exists := tl.fields[fieldNumberStr]; exists {
		return &fieldDef, true
	}
	return nil, false
}

// GetFieldName returns human-readable field name
func (tl *TemplateLoader) GetFieldName(fieldNumber int) string {
	if fieldDef, exists := tl.GetFieldDefinition(fieldNumber); exists {
		return fieldDef.FieldDescription
	}
	return fmt.Sprintf("Field %d", fieldNumber)
}

// GetAllFields returns all field definitions
func (tl *TemplateLoader) GetAllFields() map[string]FieldDefinition {
	return tl.fields
}

// GetTemplateName returns template identifier
func (tl *TemplateLoader) GetTemplateName() string {
	return "ISO8583 Standard Fields"
}

// GetTemplateVersion returns template version
func (tl *TemplateLoader) GetTemplateVersion() string {
	return "1.0"
}

// IsVariableLength checks if field type is variable length
func (tl *TemplateLoader) IsVariableLength(fieldNumber int) bool {
	if fieldDef, exists := tl.GetFieldDefinition(fieldNumber); exists {
		return fieldDef.FieldType == "LLVAR" || fieldDef.FieldType == "LLLVAR"
	}
	return false
}

// GetMaxLength returns maximum field length as integer
func (tl *TemplateLoader) GetMaxLength(fieldNumber int) int {
	if fieldDef, exists := tl.GetFieldDefinition(fieldNumber); exists {
		if length, err := strconv.Atoi(fieldDef.FieldLength); err == nil {
			return length
		}
	}
	return 0
}
