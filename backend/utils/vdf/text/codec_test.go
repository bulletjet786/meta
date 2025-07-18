package text

import (
	"os"
	"reflect"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("VDF Codec", func() {

	Describe("Localization Round Trip", func() {
		It("should correctly unmarshal and marshal localization data", func() {
			type LocalizationData struct {
				Localization struct {
					SChinese struct {
						StoreTags map[string]string `vdf:"store_tags"`
					} `vdf:"schinese"`
				} `vdf:"localization"`
			}

			vdfData := `
				"localization"
				{
					"schinese"
					{
						"store_tags"
						{
							"1756"		"好评原声音轨"
							"1628"		"类银河战士恶魔城"
						}
					}
				}
			`

			var data LocalizationData
			err := Unmarshal([]byte(vdfData), &data)
			Expect(err).NotTo(HaveOccurred())

			Expect(data.Localization.SChinese.StoreTags["1756"]).To(Equal("好评原声音轨"))
			Expect(data.Localization.SChinese.StoreTags["1628"]).To(Equal("类银河战士恶魔城"))

			marshaledBytes, err := Marshal(&data)
			Expect(err).NotTo(HaveOccurred())

			var roundTripData LocalizationData
			err = Unmarshal(marshaledBytes, &roundTripData)
			Expect(err).NotTo(HaveOccurred())

			Expect(roundTripData).To(Equal(data))
		})
	})

	Describe("Decoder Error Handling", func() {
		It("should return an error for missing top-level key", func() {
			input := `{ "key" "value" }`
			var v struct{}
			err := Unmarshal([]byte(input), &v)
			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("expected a string key at the beginning"))
		})

		It("should return an error for missing opening brace", func() {
			input := `"root" "value"`
			var v struct {
				Root struct{} `vdf:"root"`
			}
			err := Unmarshal([]byte(input), &v)
			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("expected '{' after top level key"))
		})

		It("should return an error for malformed key-value pair", func() {
			input := `"root" { "key" }`
			var v struct {
				Root struct {
					Key string `vdf:"key"`
				} `vdf:"root"`
			}
			err := Unmarshal([]byte(input), &v)
			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("expected '{' or string value after key"))
		})

		It("should return an error for unclosed object", func() {
			input := `"root" { "key" "value"`
			var v struct {
				Root struct {
					Key string `vdf:"key"`
				} `vdf:"root"`
			}
			err := Unmarshal([]byte(input), &v)
			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("unexpected end of file, object not closed"))
		})
	})

	Describe("LibraryFolders Unmarshal", func() {
		It("should correctly unmarshal libraryfolders.vdf", func() {

			vdfData := `
				"libraryfolders"
				{
					"0"
					{
						"path"		"C:\\Program Files (x86)\\Steam"
						"label"		""
						"contentid"		"8411395154589011799"
						"totalsize"		"0"
						"update_clean_bytes_tally"		"70000464"
						"time_last_update_verified"		"1747924787"
						"apps"
						{
							"228980"		"441501271"
						}
					}
					"1"
					{
						"path"		"E:\\SteamLibrary"
						"label"		""
						"contentid"		"6642914801988397442"
						"totalsize"		"322122543104"
						"update_clean_bytes_tally"		"2148535852"
						"time_last_update_verified"		"1751827451"
						"apps"
						{
							"105600"		"687925078"
						}
					}
				}
			`

			var actualData LibraryFoldersData
			err := Unmarshal([]byte(vdfData), &actualData)
			Expect(err).NotTo(HaveOccurred())

			expectedData := LibraryFoldersData{
				Folders: map[string]LibraryFolder{
					"0": {
						Path:                   "C:\\Program Files (x86)\\Steam",
						Label:                  "",
						ContentID:              8411395154589011799,
						TotalSize:              0,
						UpdateCleanBytesTally:  70000464,
						TimeLastUpdateVerified: 1747924787,
						Apps:                   map[string]string{"228980": "441501271"},
					},
					"1": {
						Path:                   "E:\\SteamLibrary",
						Label:                  "",
						ContentID:              6642914801988397442,
						TotalSize:              322122543104,
						UpdateCleanBytesTally:  2148535852,
						TimeLastUpdateVerified: 1751827451,
						Apps:                   map[string]string{"105600": "687925078"},
					},
				},
			}

			Expect(reflect.DeepEqual(actualData, expectedData)).To(BeTrue())
		})
	})

	Describe("MarshalMap", func() {
		It("should correctly marshal and marshal a map to VDF", func() {
			m := map[string]interface{}{
				"key1": "value1",
				"key2": map[string]interface{}{
					"nested_key": "nested_value",
				},
			}

			marshaledBytes, err := MarshalMap("MyVDF", m)
			Expect(err).NotTo(HaveOccurred())

			// Unmarshal the result back and check for equality
			topKey, unmarshaledMap, err := UnmarshalMap(marshaledBytes)
			Expect(err).NotTo(HaveOccurred())
			Expect(topKey).To(Equal("MyVDF"))
			Expect(unmarshaledMap).To(Equal(m))
		})
	})

	Describe("AppInfo Round Trip with real data", func() {
		It("should correctly unmarshal and marshal appinfo data from editor_1289310.vdf", func() {
			// Read the original VDF file content
			vdfBytes, err := os.ReadFile("editor_1289310.vdf")
			Expect(err).NotTo(HaveOccurred())

			// Unmarshal the original data into a map
			originalTopKey, originalMap, err := UnmarshalMap(vdfBytes)
			Expect(err).NotTo(HaveOccurred())

			// Marshal the map back to VDF bytes
			marshaledBytes, err := MarshalMap(originalTopKey, originalMap)
			Expect(err).NotTo(HaveOccurred())

			// Unmarshal the generated VDF bytes back into a map
			roundTripTopKey, roundTripMap, err := UnmarshalMap(marshaledBytes)
			Expect(err).NotTo(HaveOccurred())

			// Compare the top-level keys
			Expect(roundTripTopKey).To(Equal(originalTopKey))

			// Compare the data maps. This is a deep comparison of the data structure.
			// It ensures that all data is preserved correctly after a full
			// serialization/deserialization cycle. This is more robust than a
			// byte-for-byte comparison of the files, which can fail due to
			// non-semantic differences like key ordering in maps or whitespace.
			Expect(roundTripMap).To(Equal(originalMap))
		})
	})
})
