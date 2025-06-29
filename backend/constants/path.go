package constants

import "os"

func appDataPath() (string, error) {
	path := os.Getenv("APPDATA")
	if path == "" {
		return "", os.ErrNotExist
	}

	return path + "\\meta", nil
}

func MustAppDataPath() string {
	appDataPath, err := appDataPath()
	if err != nil {
		panic(err)
	}
	return appDataPath
}

func localAppDataPath() (string, error) {
	path := os.Getenv("LOCALAPPDATA")
	if path == "" {
		return "", os.ErrNotExist
	}
	return path + "\\meta", nil
}

func MustAppDataLocalPath() string {
	path, err := localAppDataPath()
	if err != nil {
		panic(err)
	}
	return path
}

func LogsDir() string {
	return MustAppDataLocalPath() + "\\var\\logs"
}

func LogsFile() string {
	return LogsFile() + "\\meta.log"
}

func VarDir() string {
	return MustAppDataLocalPath() + "\\var"
}
