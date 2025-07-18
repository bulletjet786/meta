package steam

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestSteam(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Steam Suite")
}
