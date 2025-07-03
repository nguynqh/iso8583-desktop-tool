package loader

import (
	"fmt"
	"os"
	"path/filepath"
)

func ListTemplateFiles(dir string) ([]string, error) {

	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var result []string
	for _, f := range files {
		if filepath.Ext(f.Name()) == ".json" {
			result = append(result, f.Name())
		}
	}
	fmt.Printf("After process found %d files\n", len(result))
	return result, nil
}
