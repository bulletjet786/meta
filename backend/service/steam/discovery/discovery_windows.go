//go:build windows

package discovery

import (
	"fmt"
	"strings"

	registry "golang.org/x/sys/windows/registry"
)

var (
	// 我们不考虑windows 32位系统
    steamSoftwareRegistryKeyForWindows = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam"
)

var (
	ErrorSteamNotFound = fmt.Errorf("Steam not found")
)

func LookUpSteamCEFDebuggingFilePath() (string, error) {
	key, err := registry.OpenKey(registry.LOCAL_MACHINE, "SOFTWARE\\Valve\\Steam", registry.QUERY_VALUE)
	if err != nil {
		return "", ErrorSteamNotFound
	}

	steamRegistry := SteamSoftwareRegistryInfo{}
	steamRegistry.DisplayName, _, err = key.GetStringValue("DisplayName")
	steamRegistry.DisplayIcon, _, err = key.GetStringValue("DisplayIcon")
	steamRegistry.DisplayVersion, _, err = key.GetStringValue("DisplayVersion")
	steamRegistry.Publisher, _, err = key.GetStringValue("Publisher")
	steamRegistry.UninstallString, _, err = key.GetStringValue("UninstallString")

	if steamRegistry.UninstallString == "" {
		return "", ErrorSteamNotFound
	}
	
	if !strings.HasSuffix(steamRegistry.UninstallString, "\\uninstall.exe") {
		return "", ErrorSteamNotFound
	}
	return strings.TrimSuffix(steamRegistry.UninstallString, "\\uninstall.exe") + ".cef-enable-debugging", nil
}

type SteamSoftwareRegistryInfo struct {
	DisplayName string
	DisplayIcon string
	DisplayVersion string
	Publisher string
	UninstallString string
}
