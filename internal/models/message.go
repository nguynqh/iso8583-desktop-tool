package models

type ParsedField struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
	Type        string `json:"type,omitempty"`
	Length      int    `json:"length,omitempty"`
	Required    bool   `json:"required,omitempty"`
}

type ParsedMessage struct {
	MTI          string        `json:"mti"`
	Fields       []ParsedField `json:"fields"`
	FieldCount   int           `json:"fieldCount"`
	TemplateName string        `json:"templateName,omitempty"`
}
