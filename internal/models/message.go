package models

type ParsedField struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Value string `json:"value"`
}

type ParsedMessage struct {
	MTI    string        `json:"mti"`
	Fields []ParsedField `json:"fields"`
}
