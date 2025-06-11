package parser

import (
	"fmt"
	"testing"
)

func TestParseSimpleMessage(t *testing.T) {
	testMessage := "MTI=0200,F2:970403******2051,F3:502010,F4:000002706000,F11:123125"

	result, err := ParseSimpleMessage(testMessage)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if result.MTI != "0200" {
		t.Errorf("Expected MTI=0200, got: %s", result.MTI)
	}

	if len(result.Fields) != 4 {
		t.Errorf("Expected 4 fields, got: %d", len(result.Fields))
	}

	// Check first field
	if result.Fields[0].ID != 2 {
		t.Errorf("Expected field ID=2, got: %d", result.Fields[0].ID)
	}

	fmt.Printf("Parsed Message: MTI=%s, Fields=%v\n", result.MTI, result.Fields)
}

func TestParseMultipleMessages(t *testing.T) {
	messages := []string{
		"MTI=0200,F2:value1,F3:value2",
		"MTI=0210,F2:value3,F4:value4",
	}

	results, err := ParseMultipleMessages(messages)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if len(results) != 2 {
		t.Errorf("Expected 2 results, got: %d", len(results))
	}
}
