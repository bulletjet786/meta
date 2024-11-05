//go:build windows

package machine

import (
	"fmt"
	"log/slog"

	"github.com/whosonfirst/go-rfc-5646"
	"github.com/whosonfirst/go-rfc-5646/tags"
	"golang.org/x/sys/windows/registry"
)

const (
	languageRegistryKeyForWindows = "Control Panel\\International\\User Profile"
)

func FindLanguageTag() (*rfc5646.LanguageTag, error) {
	key, err := registry.OpenKey(registry.CURRENT_USER, languageRegistryKeyForWindows, registry.QUERY_VALUE)
	if err != nil {
		slog.Error("open windows registry key failed", "key", languageRegistryKeyForWindows)
		return nil, fmt.Errorf("registry key not found")
	}

	languages, _, err := key.GetStringsValue("Languages")
	if err != nil {
		slog.Error("get windows registry key value failed", "key", languageRegistryKeyForWindows, "err", err)
		return nil, fmt.Errorf("get registry key language failed")
	}
	languageTag, err := tags.NewLangTag(languages[0])
	if err != nil {
		slog.Error("parse language tag failed", "tag", languages[0])
		return nil, fmt.Errorf("parse language tag failed")
	}

	return &languageTag, nil
}
