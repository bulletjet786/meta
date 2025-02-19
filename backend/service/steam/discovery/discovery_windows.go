//go:build windows

package discovery

import (
	"fmt"
	registry "golang.org/x/sys/windows/registry"
	"log/slog"
)

const (
	// 我们不考虑windows 32位系统
	steamSoftwareRegistryKeyForWindows = "SOFTWARE\\WOW6432Node\\Valve\\Steam"
)

var (
	ErrorSteamNotFound = fmt.Errorf("steam not found")
)

func LookUpSteamCEFDebuggingFilePath() (string, error) {
	key, err := registry.OpenKey(registry.LOCAL_MACHINE, steamSoftwareRegistryKeyForWindows, registry.QUERY_VALUE)
	if err != nil {
		slog.Error("open windows registry key failed", "key", steamSoftwareRegistryKeyForWindows)
		return "", ErrorSteamNotFound
	}

	steamRegistry := SteamSoftwareRegistryInfo{}
	steamRegistry.InstallPath, _, err = key.GetStringValue("InstallPath")
	steamRegistry.Language, _, err = key.GetStringValue("Language")

	if steamRegistry.InstallPath == "" {
		slog.Error("windows registry steam install path empty")
		return "", ErrorSteamNotFound
	}
	slog.Info("found steam string path", "path", steamRegistry.InstallPath)

	return steamRegistry.InstallPath + "\\.cef-enable-remote-debugging", nil
}

type SteamSoftwareRegistryInfo struct {
	InstallPath string
	Language    string
}
