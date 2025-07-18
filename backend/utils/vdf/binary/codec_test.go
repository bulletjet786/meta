package binary

import (
	"io/ioutil"
	"os"
	"testing"
)

// TestUnmarshalShortcuts tests the Unmarshal function with a real shortcuts.vdf file.
func TestUnmarshalShortcuts(t *testing.T) {
	// This struct hierarchy perfectly matches the VDF file structure:
	// A top-level object with a "shortcuts" key, which contains a map of shortcut objects.
	type Shortcut struct {
		AppName            string            `vdf:"AppName"`
		Exe                string            `vdf:"Exe"`
		Icon               string            `vdf:"Icon"`
		LastPlayTime       uint32            `vdf:"LastPlayTime"`
		IsHidden           uint32            `vdf:"IsHidden"`
		AllowDesktopConfig uint32            `vdf:"AllowDesktopConfig"`
		AllowOverlay       uint32            `vdf:"AllowOverlay"`
		OpenVR             uint32            `vdf:"OpenVR"`
		Devkit             uint32            `vdf:"Devkit"`
		DevkitGameID       string            `vdf:"DevkitGameID"`
		Tags               map[string]string `vdf:"tags"`
	}

	type Root struct {
		Shortcuts map[string]Shortcut `vdf:"shortcuts"`
	}

	// Read the binary VDF file.
	file, err := os.Open("../binary/shortcuts.vdf")
	if err != nil {
		t.Fatalf("Failed to read shortcuts.vdf: %v", err)
	}
	defer file.Close()

	data, err := ioutil.ReadAll(file)
	if err != nil {
		t.Fatalf("Failed to read data from shortcuts.vdf: %v", err)
	}

	var root Root
	if err := Unmarshal(data, &root); err != nil {
		t.Fatalf("Unmarshal failed: %v", err)
	}

	// Basic validation: Check if any shortcuts were parsed.
	if len(root.Shortcuts) == 0 {
		t.Fatal("No shortcuts were unmarshaled from the file.")
	}

	// More specific validation: Iterate and check for non-empty fields.
	found := false
	for key, s := range root.Shortcuts {
		if s.AppName != "" && s.Exe != "" {
			found = true
			t.Logf("Successfully parsed shortcut [key: %s]: %s (%s)", key, s.AppName, s.Exe)
			break
		}
	}

	if !found {
		t.Error("Parsed shortcuts, but all of them have empty AppName or Exe fields.")
	}
}
