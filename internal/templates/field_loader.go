package templates

import (
    "fmt"
    "encoding/json"
    "os"
)

type FieldDefinition struct {
    Name string `json:"name"`
    Description string `json:"description"`
    Type string `json:"type"`
    Length int `json:"length"`
    Required bool `json:"required"`
}


type ISO8583Template struct {
    Name string `json:"name"`
}

type TemplateLoader struct {
    template *ISO8583Template
}

func NewTemplateLoader() *TemplateLoader {
	return &TemplateLoader{}
}

func (tl *TemplateLoader) LoadTemplate(templatePath string) error {
	data, err := os.ReadFile(templatePath)
	if err != nil {
		return fmt.Errorf("failed to read template file: %w", err)
	}

	var template ISO8583Template
	if err := json.Unmarshal(data, &template); err != nil {
		return fmt.Errorf("failed to parse template JSON: %w", err)
	}

	tl.template = &template
	fmt.Printf("Loaded template: %s\n", tl.template.Name)
	return nil
}

func (tl *TemplateLoader) GetFieldName(fieldID int) string {
	if tl.template == nil {
		return fmt.Sprintf("Field %d", fieldID) // Default name if template is not loaded
	}

	fieldIDStr := fmt.Sprintf("%d", fieldID)
	if fieldDef, exits := tl.template.Fields[fieldIDStr]; exists {
		return fieldDef.Name
	}

	return fmt.Sprintf("Field %d", fieldID)
}

func (tl *TemplateLoader) GetFieldDefinition(fieldID int) (*FieldDefinition, bool) {
	if tl.template == nil {
		return nil, false
	}

	fieldIDStr := fmt.Sprintf("%d", fieldID)
	if fieldDef, exists := tl.template.Fields[fieldIDStr]; exists {
		return &fieldDef, true
	}

	return nil, false
}

func (tl *TemplateLoader) GetTemplateName() string {
	if tl.template == nil {
		return "Default"
	}
	return tl.template.Name
}