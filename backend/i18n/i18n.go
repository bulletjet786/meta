package i18n

import (
	"embed"
	"log/slog"
	"os"
	"path"
	"strings"

	"github.com/nicksnyder/go-i18n/v2/i18n"
	"golang.org/x/text/language"
)

//go:embed ./locales/active.*.json
var LocaleFS embed.FS
var bundle *i18n.Bundle

func init() {
	bundle = i18n.NewBundle(language.English)

	// 加载所有翻译文件
	entries, err := LocaleFS.ReadDir("locales")
	if err != nil {
		slog.Info("Failed to read i18n fs", "error", err)
		os.Exit(1)
		return
	}
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".json") {
			filePath := path.Join("locales", entry.Name())
			data, err := LocaleFS.ReadFile(filePath)
			if err != nil {
				slog.Info("Failed to read i18n file", "filePath", filePath, "error", err)
				os.Exit(1)
				return
			}
			if _, err := bundle.ParseMessageFileBytes(data, filePath); err != nil {
				slog.Info("Failed to parse i18n file", "filePath", filePath, "error", err)
				os.Exit(1)
				return
			}
			slog.Info("load i18n language from file", "filePath", filePath)
		}
	}
}

func T() {

}

func Td() {

}

func Tp() {

}
