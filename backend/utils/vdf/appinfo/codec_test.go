package appinfo

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestVDFCodec(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "VDF Codec Suite")
}

// prettyPrintJSON is a helper to print maps in a readable format for the test log.
func prettyPrintJSON(v interface{}) string {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return fmt.Sprintf("Failed to pretty print data to JSON: %v", err)
	}
	return string(b)
}

var _ = Describe("VDF Codec", func() {
	var originalVdfData []byte
	var originalApps []AppInfo
	var originalVersion uint64

	BeforeEach(func() {
		file, err := os.Open("appinfo.vdf")
		Expect(err).Should(Succeed())
		defer file.Close()

		originalVdfData, err = ioutil.ReadAll(file)
		Expect(err).Should(Succeed())

		// We still use Unmarshal here to get a baseline for comparison
		originalApps, originalVersion, err = Unmarshal(originalVdfData)
		Expect(err).Should(Succeed())
		Expect(originalApps).NotTo(BeEmpty(), "Should parse at least one application from the test file")
	})

	Describe("Unmarshal function", func() {
		It("should correctly parse appinfo.vdf", func() {
			fmt.Printf("Parsed information for %d applications with version 0x%x.\n", len(originalApps), originalVersion)
			if len(originalApps) > 0 {
				fmt.Println("First parsed app (via Unmarshal):")
				fmt.Printf("\n%s\n\n", prettyPrintJSON(originalApps[0]))
			}
		})
	})

	Describe("Marshal function", func() {
		It("should perform a successful round-trip (unmarshal -> marshal -> unmarshal)", func() {
			marshaledData, err := Marshal(originalApps)
			Expect(err).Should(Succeed())

			roundTripApps, roundTripVersion, err := Unmarshal(marshaledData)
			Expect(err).Should(Succeed())

			Expect(roundTripVersion).To(Equal(version41), "Encoded version should default to 41")
			Expect(len(roundTripApps)).To(Equal(len(originalApps)), "Number of apps should be the same after round-trip")

			originalFirstAppJSON := prettyPrintJSON(originalApps[0])
			roundTripFirstAppJSON := prettyPrintJSON(roundTripApps[0])
			Expect(roundTripFirstAppJSON).To(MatchJSON(originalFirstAppJSON), "The first app should be identical after a round-trip")

			fmt.Println("Successfully completed Marshal/Unmarshal round-trip test.")
		})
	})

	Describe("Direct Encoder/Decoder usage", func() {
		It("should perform a successful round-trip (decode -> encode -> decode)", func() {
			// 1. Decode using the Decoder directly
			decoder, err := NewDecoder(originalVdfData)
			Expect(err).Should(Succeed())
			decodedApps, err := decoder.Decode()
			Expect(err).Should(Succeed())
			Expect(len(decodedApps)).To(Equal(len(originalApps)))

			// 2. Encode using the Encoder directly
			var buf bytes.Buffer
			encoder := NewEncoder(&buf)
			err = encoder.Encode(decodedApps)
			Expect(err).Should(Succeed())
			encodedBytes := buf.Bytes()

			// 3. Decode the result again
			decoder2, err := NewDecoder(encodedBytes)
			Expect(err).Should(Succeed())
			roundTripApps, err := decoder2.Decode()
			Expect(err).Should(Succeed())

			// 4. Verify the results
			Expect(decoder2.version).To(Equal(version41), "Encoded version should be 41")
			Expect(len(roundTripApps)).To(Equal(len(decodedApps)), "Number of apps should be the same after round-trip")

			originalFirstAppJSON := prettyPrintJSON(decodedApps[0])
			roundTripFirstAppJSON := prettyPrintJSON(roundTripApps[0])
			Expect(roundTripFirstAppJSON).To(MatchJSON(originalFirstAppJSON), "The first app should be identical after a direct encoder/decoder round-trip")

			fmt.Println("Successfully completed direct Encoder/Decoder round-trip test.")
		})
	})
})
