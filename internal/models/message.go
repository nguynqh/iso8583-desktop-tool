package models

// ValidationError represents a field validation issue
type ValidationError struct {
	FieldID     int    `json:"fieldId"`
	FieldName   string `json:"fieldName"`
	ErrorType   string `json:"errorType"` // "length", "type", "format", "pattern", "missing"
	Expected    string `json:"expected"`
	Actual      string `json:"actual"`
	Severity    string `json:"severity"` // "error", "warning", "info"
	Message     string `json:"message"`
	RuleApplied string `json:"ruleApplied"` // Which validation rule was applied
}

// ParsedField represents a single parsed ISO8583 field with validation
type ParsedField struct {
	ID           int               `json:"id"`
	Name         string            `json:"name"`
	Value        string            `json:"value"`
	Description  string            `json:"description"`
	FieldType    string            `json:"fieldType"`    // Fixed, LLVAR, LLLVAR, Bitmap
	MaxLength    int               `json:"maxLength"`    // Maximum allowed length
	ActualLength int               `json:"actualLength"` // Current value length
	Pattern      string            `json:"pattern"`      // Expected pattern
	IsValid      bool              `json:"isValid"`
	Errors       []ValidationError `json:"errors,omitempty"`
	Warnings     []ValidationError `json:"warnings,omitempty"`
	ParseMethod  string            `json:"parseMethod"` // How this field was parsed
}

// ValidationSummary provides overall message validation statistics
type ValidationSummary struct {
	TotalFields     int     `json:"totalFields"`
	ValidFields     int     `json:"validFields"`
	ErrorCount      int     `json:"errorCount"`
	WarningCount    int     `json:"warningCount"`
	FieldsCoverage  float64 `json:"fieldsCoverage"`  // % of fields with template definitions
	ValidationScore float64 `json:"validationScore"` // Overall validation score (0-100)
	MissingRequired []int   `json:"missingRequired,omitempty"`
	UnknownFields   []int   `json:"unknownFields,omitempty"`
}

// ParsedMessage represents a complete parsed ISO8583 message
type ParsedMessage struct {
	MTI               string            `json:"mti"`
	MTIDescription    string            `json:"mtiDescription"`
	Fields            []ParsedField     `json:"fields"`
	FieldCount        int               `json:"fieldCount"`
	TemplateName      string            `json:"templateName"`
	IsValid           bool              `json:"isValid"`
	ValidationSummary ValidationSummary `json:"validationSummary"`
	ParsedAt          string            `json:"parsedAt"`
	ParsingMethod     string            `json:"parsingMethod"` // Simple, Advanced, etc.
}

// MTIInfo provides MTI interpretation
type MTIInfo struct {
	Code        string `json:"code"`
	Version     string `json:"version"`  // Position 1: Version
	Class       string `json:"class"`    // Position 2: Message Class
	Function    string `json:"function"` // Position 3: Message Function
	Origin      string `json:"origin"`   // Position 4: Message Origin
	Description string `json:"description"`
}
