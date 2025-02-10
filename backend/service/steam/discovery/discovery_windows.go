//go:build windows

package discovery

import (
	registry "golang.org/x/sys/windows/registry"
)

const (
    SoftwareRegistryKeyForWin64 = "SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall"
    SoftwareRegistryKeyForWin32 = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall"
)

func LookUpSteamCEFDebuggingFilePath() (string, error) {
	registry.OpenKey(registry.LOCAL_MACHINE, "SOFTWARE\\Valve\\Steam", registry.QUERY_VALUE)



	return "", nil
}
