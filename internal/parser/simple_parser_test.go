package parser

import (
	"fmt"
	"testing"
)

// import (
// 	"encoding/json"
// 	"fmt"
// 	"strconv"

// 	"github.com/moov-io/iso8583"
// )

// type Validate struct {
// }

// type ISOData struct {
// 	MTI       string            `json:"mti"`
// 	ListField map[string]string `json:"listField"`
// }

// func main() {
// --------Pack
// msg := iso8583.NewMessage(iso8583.Spec87)
// msg.MTI("0200")
// msg.Field(2, "1234567890123456") // PAN
// msg.Field(4, "000010000000")     // Amount

// packed, err := msg.Pack()
// if err != nil {
// 	panic(err)
// }
// fmt.Printf("ISO8583 packed: %s\n", string(packed))

// --------Unpack
// rawMsg := ""
// 	msg := iso8583.NewMessage(iso8583.Spec87)

//     err := msg.Unpack([]byte(rawMsg))
//     if err != nil {
//         panic(err)
//     }

// 	mti, _ := msg.GetMTI()
// 	fmt.Println("MTI:", mti)
// 	fmt.Println("Field 2 (PAN):", msg.GetField(2))
// 	fmt.Println("Field 4 (Amount):", msg.GetField(4))

// raw := `{"mti":"0210","bitmap":"723E4481A8E09804","listField":{"32":"426088","2":"9704030148952051","3":"502010","4":"000002706000","37":"511530199124","38":"864491","7":"0425085750","39":"00","41":"00005001","42":"000000099999999","11":"123125","12":"085750","13":"0425","49":"704","18":"6011","57":"NGUYEN NGOC DUC","28":"000000000"}}`

// var isoData ISOData
// if err := json.Unmarshal([]byte(raw), &isoData); err != nil {
// 	fmt.Println("Error parsing JSON:", err)
// 	return
// }

// msg := iso8583.NewMessage(iso8583.Spec87)
// msg.MTI(isoData.MTI)
// for key, value := range isoData.ListField {
// 	fieldNum, err := strconv.Atoi(key)
// 	if err != nil {
// 		fmt.Printf("Error converting key '%s' to int: %v\n", key, err)
// 		continue
// 	}
// 	msg.Field(fieldNum, value)
// }

// packed, err := msg.Pack()
// if err != nil {
// 	fmt.Println("Error packing message:", err)
// 	return
// }

// fmt.Printf("ISO8583 packed: %s\n", string(packed))

// }

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
