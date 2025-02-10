//go:build linux

package discovery

import (
	"os"
)

func LookUpSteamCEFDebuggingFilePath() (string, error) {

	homePath, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	return homePath + "/.steam/steam/.cef-enable-remote-debugging", nil
}
