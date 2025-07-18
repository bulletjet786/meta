package steam

import (
	"os"
	"path/filepath"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"meta/backend/utils/vdf/appinfo"
)

var _ = Describe("AccessAppExtended", func() {
	It("should return the correct value when keys exist", func() {
		app := appinfo.AppInfo{
			Extended: map[string]interface{}{
				"appinfo": map[string]interface{}{
					"common": map[string]interface{}{
						"type": "Game",
					},
				},
			},
		}
		value, err := AccessAppExtended(app, "appinfo", "common", "type")
		Expect(err).NotTo(HaveOccurred())
		Expect(value).To(Equal("Game"))
	})

	It("should return an error when a key is missing", func() {
		app := appinfo.AppInfo{
			Extended: map[string]interface{}{
				"appinfo": map[string]interface{}{
					"common": map[string]interface{}{},
				},
			},
		}
		_, err := AccessAppExtended(app, "appinfo", "common", "type")
		Expect(err).To(HaveOccurred())
	})

	It("should return an error when the value is not a map", func() {
		app := appinfo.AppInfo{
			Extended: map[string]interface{}{
				"appinfo": "not a map",
			},
		}
		_, err := AccessAppExtended(app, "appinfo", "common", "type")
		Expect(err).To(HaveOccurred())
	})

	It("should return an error when the final value is not a string", func() {
		app := appinfo.AppInfo{
			Extended: map[string]interface{}{
				"appinfo": map[string]interface{}{
					"common": map[string]interface{}{
						"type": 123,
					},
				},
			},
		}
		_, err := AccessAppExtended(app, "appinfo", "common", "type")
		Expect(err).To(HaveOccurred())
	})
})

var _ = Describe("ChangeLibraries", func() {
	var service *Service
	var testDataDir string
	var tempDir string

	BeforeEach(func() {
		service = NewService(ServiceOptions{})
		testDataDir = "testdata"
		tempDir = "tmp"
		// Create a temp directory for generated files
		err := os.MkdirAll(tempDir, 0755)
		Expect(err).NotTo(HaveOccurred())
	})

	AfterEach(func() {
		// Clean up the temporary directory
		os.RemoveAll(tempDir)
	})

	It("should change the display name of a game", func() {
		changes := []LibraryChange{
			{AppID: 1289310, DisplayName: "地狱把妹王"},
		}

		appInfoPath := filepath.Join(testDataDir, "appinfo.vdf")
		tempAppInfoPath := filepath.Join(tempDir, "appinfo.vdf.tmp")

		err := service.changeLibrariesTo(changes, appInfoPath, tempAppInfoPath)
		Expect(err).NotTo(HaveOccurred())

		// Verify the change
		modifiedData, err := os.ReadFile(tempAppInfoPath)
		Expect(err).NotTo(HaveOccurred())

		allApps, _, err := appinfo.Unmarshal(modifiedData)
		Expect(err).NotTo(HaveOccurred())

		found := false
		for _, app := range allApps {
			if app.AppID == 1289310 {
				displayName, _ := AccessAppExtended(app, "appinfo", "common", "name_localized", "schinese")
				Expect(displayName).To(Equal("地狱把妹王"))
				found = true
				break
			}
		}
		Expect(found).To(BeTrue(), "App with ID 1289310 not found after change")
	})
})
