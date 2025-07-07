package loader

import (
	"fmt"
	"os"
	"path/filepath"
)

type TemplateFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

func ListTemplateFiles(dir string) ([]TemplateFile, error) {

	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var result []TemplateFile
	for _, f := range files {
		if filepath.Ext(f.Name()) == ".json" {
			filePath := filepath.Join(dir, f.Name())
			content, err := os.ReadFile(filePath)
			if err != nil {
				fmt.Printf("Error reading file %s: %v\n", f.Name(), err)
				continue
			}
			result = append(result, TemplateFile{
				Name:    f.Name(),
				Content: string(content),
			})
		}
	}
	fmt.Printf("After process found %d files\n", len(result))
	return result, nil
}
