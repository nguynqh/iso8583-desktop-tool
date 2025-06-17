package models

// ParsedField represents a single parsed ISO8583 field
type ParsedField struct {
	ID                int    `json:"id"`
	Name              string `json:"name"`
	Value             string `json:"value"`
	FieldType         string `json:"fieldType"`    // Fixed, LLVAR, LLLVAR, Bitmap
	MaxLength         int    `json:"maxLength"`    // Maximum allowed length
	ActualLength      int    `json:"actualLength"` // Current value length
	Pattern           string `json:"pattern"`      // Expected pattern
	IsValid           bool   `json:"isValid"`
	Error             string `json:"error,omitempty"`   // Validation error message
	IsPresentInBitmap bool   `json:"isPresentInBitmap"` // For bitmap fields
}

// ParsedMessage represents a complete parsed ISO8583 message
type ParsedMessage struct {
	MTI        string        `json:"mti"`
	Format     string        `json:"format"`           // "Simple" or "JSON"
	Bitmap     *BitmapInfo   `json:"bitmap,omitempty"` // Only for JSON format
	Fields     []ParsedField `json:"fields"`
	IsValid    bool          `json:"isValid"`
	ErrorCount int           `json:"errorCount"`
	ParsedAt   string        `json:"parsedAt"`
}

// JSONMessage for parsing JSON format
type JSONMessage struct {
	MTI       string            `json:"mti"`
	Bitmap    string            `json:"bitmap"`
	ListField map[string]string `json:"listField"` // Field name to value mapping
}

// BitmapInfo represents bitmap analysis
type BitmapInfo struct {
	HexValue      string `json:"hexValue"`
	BinaryValue   string `json:"binaryValue"`
	PresentFields []int  `json:"presentFields"`
	IsValid       bool   `json:"isValid"`
	Error         string `json:"error,omitempty"`
}
