package steam

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/samber/lo"

	"meta/backend/constants"
	"meta/backend/service/machine"
	"meta/backend/service/setting"
	"meta/backend/service/steam/common"
	"meta/backend/service/steam/discovery"
	"meta/backend/service/steam/plugin"
	"meta/backend/utils/vdf/appinfo"
	"meta/backend/utils/vdf/text"
)

// prettyPrintJSON is a helper to print maps in a readable format for the test log.
func prettyPrintJSON(v interface{}) string {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return fmt.Sprintf("Failed to pretty print data to JSON: %v", err)
	}
	return string(b)
}

type Service struct {
	options ServiceOptions
	plugins []plugin.SteamPlugin

	chromeHolder ChromeHolder
}

type ServiceOptions struct {
	RemoteUrl      string
	Subscriber     []common.StatusSubscriber
	MachineInfo    machine.Info
	GetSettingFunc func() setting.Setting
}

func NewService(options ServiceOptions) *Service {
	return &Service{
		options: options,
	}
}

func (s *Service) Start() {
	s.plugins = []plugin.SteamPlugin{
		plugin.NewSteamExtensionInjector(s.options.MachineInfo, s.options.GetSettingFunc),
	}
	for _, p := range s.plugins {
		if err := p.Init(); err != nil {
			slog.Error("Init steam plugin failed", "name", p.Name(), "err", err)
			os.Exit(1)
		}
	}
	s.chromeHolder = NewChromeHolder(s.options.RemoteUrl)
	s.chromeHolder.Run()
	s.startPlugins()
	s.StartBackgroundUpdater()
}

func (s *Service) startPlugins() {
	go func() {
		lastState := StatusDisconnected
		for status := range s.chromeHolder.statusChannel {
			slog.Info("Receive status", "status", status)

			for _, sub := range s.options.Subscriber {
				sub(status)
			}

			if lastState == StatusDisconnected && status.State == StatusConnected {
				slog.Info("Found status change to connected", "status", status)
				if chromeCtx := s.chromeHolder.ChromeCtx(); chromeCtx != nil {
					for _, p := range s.plugins {
						go p.Run(*chromeCtx)
					}
				}
			}
			lastState = status.State
		}
	}()
}

func (s *Service) Status() common.Status {
	return s.chromeHolder.Status()
}

func (s *Service) StartBackgroundUpdater() {
	go func() {
		watcher, err := fsnotify.NewWatcher()
		if err != nil {
			slog.Error("failed to create fsnotify watcher", "err", err)
			return
		}
		defer watcher.Close()

		steamDir, err := discovery.LookUpSteamInstallDir()
		if err != nil {
			slog.Error("failed to find steam install dir", "err", err)
			return
		}
		appInfoFilePath := filepath.Join(steamDir, "appcache", "appinfo.vdf")

		if err := watcher.Add(filepath.Dir(appInfoFilePath)); err != nil {
			slog.Error("failed to watch appinfo.vdf", "err", err)
			return
		}

		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()

		debounceTimer := time.NewTimer(0)
		<-debounceTimer.C // Drain the timer

		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Name == appInfoFilePath && (event.Op&fsnotify.Write == fsnotify.Write || event.Op&fsnotify.Create == fsnotify.Create) {
					slog.Info("appinfo.vdf has been modified, scheduling update in 3 seconds")
					debounceTimer.Reset(3 * time.Second)
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				slog.Error("fsnotify watcher error", "err", err)
			case <-ticker.C:
				slog.Info("Periodic check triggered")
				s.applyChangesFromCache(appInfoFilePath)
			case <-debounceTimer.C:
				slog.Info("Debounced event triggered")
				s.applyChangesFromCache(appInfoFilePath)
			}
		}
	}()
}

func (s *Service) applyChangesFromCache(appInfoFilePath string) {
	changes, err := readLibraryChanges()
	if err != nil {
		slog.Error("failed to read library changes for caching", "err", err)
		return
	}

	if len(changes) == 0 {
		// No changes configured, nothing to do.
		return
	}

	appInfoFile, err := os.ReadFile(appInfoFilePath)
	if err != nil {
		slog.Error("failed to read appinfo.vdf for cache check", "err", err)
		return
	}
	allApps, _, err := appinfo.Unmarshal(appInfoFile)
	if err != nil {
		slog.Error("failed to unmarshal appinfo.vdf for cache check", "err", err)
		return
	}

	changeMap := make(map[uint32]string)
	for _, change := range changes {
		changeMap[change.AppID] = change.DisplayName
	}

	needsUpdate := false
	for _, app := range allApps {
		if expectedName, ok := changeMap[app.AppID]; ok {
			// Check schinese first, as it's the primary target
			currentName, err := AccessAppExtended(app, "appinfo", "common", "name_localized", "schinese")
			if err == nil {
				if currentName == expectedName {
					continue // This one is correct, check next app
				}
			} // If err is not nil, schinese does not exist or is invalid, so we must check the fallback.

			// Fallback to checking the 'name' field
			currentName, err = AccessAppExtended(app, "appinfo", "common", "name")
			if err == nil {
				if currentName == expectedName {
					continue // This one is correct, check next app
				}
			}

			// If we reached here, it means neither schinese nor name fields match the expected value, or they don't exist.
			slog.Info("Detected mismatch, update needed", "appid", app.AppID)
			needsUpdate = true
			break
		}
	}

	if !needsUpdate {
		slog.Info("appinfo.vdf is already up to date")
		return
	}

	slog.Info("appinfo.vdf needs update, applying changes from cache")
	if err := s.changeLibrariesTo(changes, appInfoFilePath, appInfoFilePath); err != nil {
		slog.Error("failed to apply changes from cache", "err", err)
	}
}

func (s *Service) EnableSteamCEFDebugging() error {
	cefEnableDebugging, err := discovery.LookUpSteamCEFDebuggingFilePath()
	if err != nil {
		return err
	}
	fileHandler, err := os.Create(cefEnableDebugging)
	if nil != err {
		return err
	}
	defer fileHandler.Close()
	return nil
}

func (s *Service) DisableSteamCEFDebugging() error {
	cefEnableDebugging, err := discovery.LookUpSteamCEFDebuggingFilePath()
	if err != nil {
		return err
	}
	if err = os.Remove(cefEnableDebugging); err != nil {
		return err
	}
	return nil
}

func (s *Service) SteamCEFDebuggingEnabled() bool {
	cefEnableDebugging, err := discovery.LookUpSteamCEFDebuggingFilePath()
	if err != nil {
		return false
	}
	_, err = os.Stat(cefEnableDebugging)
	slog.Info("SteamCEFDebuggingEnabled err", "err", err)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}

func (s *Service) GetApps() ([]appinfo.AppInfo, error) {
	steamDir, err := discovery.LookUpSteamInstallDir()
	if err != nil {
		return nil, err
	}

	libraryFoldersPath := filepath.Join(steamDir, "steamapps", "libraryfolders.vdf")
	libraryFoldersFile, err := os.ReadFile(libraryFoldersPath)
	if err != nil {
		return nil, err
	}

	var libraryFolders text.LibraryFoldersData
	if err := text.Unmarshal(libraryFoldersFile, &libraryFolders); err != nil {
		return nil, err
	}

	appInfoFilePath := filepath.Join(steamDir, "appcache", "appinfo.vdf")
	appInfoFile, err := os.ReadFile(appInfoFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("未找到 appinfo.vdf 文件，请先启动一次Steam以生成该文件")
		}
		return nil, err
	}

	allApps, _, err := appinfo.Unmarshal(appInfoFile)
	if err != nil {
		return nil, err
	}

	allApps = lo.Filter(allApps, func(app appinfo.AppInfo, index int) bool {
		appType, err := AccessAppExtended(app, "appinfo", "common", "type")
		if err != nil {
			return false
		}
		return appType == "Game"
	})

	return allApps, nil
}

type DisplayAppInfo struct {
	AppID       int    `json:"app_id"`
	DisplayName string `json:"display_name"`
	InstallDir  string `json:"install_dir"`
}

func (s *Service) GetDisplayApps() ([]DisplayAppInfo, error) {
	apps, err := s.GetApps()
	if err != nil {
		return nil, err
	}
	return lo.Map(apps, func(app appinfo.AppInfo, index int) DisplayAppInfo {
		displayName, err := AccessAppExtended(app, "appinfo", "common", "name_localized", "schinese")
		if err != nil {
			displayName, err = AccessAppExtended(app, "appinfo", "common", "name")
			if err != nil {
				displayName = fmt.Sprintf("AppID %d", app.AppID)
			}
		}
		installDir, err := AccessAppExtended(app, "appinfo", "config", "installdir")
		if err != nil {
			installDir = ""
		}

		return DisplayAppInfo{
			AppID:       int(app.AppID),
			DisplayName: displayName,
			InstallDir:  installDir,
		}
	}), nil
}

type LibraryChange struct {
	AppID       uint32 `json:"app_id"`
	DisplayName string `json:"display_name"`
}

func (s *Service) ChangeLibraries(changes []LibraryChange) error {
	if err := mergeLibraryChanges(changes); err != nil {
		return fmt.Errorf("failed to merge library changes: %w", err)
	}

	allChanges, err := readLibraryChanges()
	if err != nil {
		return fmt.Errorf("failed to read library changes: %w", err)
	}

	steamDir, err := discovery.LookUpSteamInstallDir()
	if err != nil {
		return err
	}
	appInfoFilePath := filepath.Join(steamDir, "appcache", "appinfo.vdf")

	return s.changeLibrariesTo(allChanges, appInfoFilePath, appInfoFilePath)
}

func (s *Service) RevertLibraries() error {
	// Remove the library changes cache file to prevent re-application of changes.
	if err := os.Remove(constants.LibraryChangesFile()); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove library changes file: %w", err)
	}

	// Remove appinfo.vdf to trigger Steam to regenerate it with original names.
	steamDir, err := discovery.LookUpSteamInstallDir()
	if err != nil {
		return err
	}
	appInfoFilePath := filepath.Join(steamDir, "appcache", "appinfo.vdf")
	if err := os.Remove(appInfoFilePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove appinfo.vdf: %w", err)
	}

	return nil
}

func (s *Service) changeLibrariesTo(changes []LibraryChange, appInfoFilePath string, savePath string) error {
	slog.Info("Applying library changes", "count", len(changes))

	appInfoFile, err := os.ReadFile(appInfoFilePath)
	if err != nil {
		return fmt.Errorf("failed to read appinfo.vdf: %w", err)
	}
	allApps, _, err := appinfo.Unmarshal(appInfoFile)
	if err != nil {
		return fmt.Errorf("failed to unmarshal appinfo.vdf: %w", err)
	}

	changeMap := make(map[uint32]string)
	for _, change := range changes {
		changeMap[change.AppID] = change.DisplayName
	}

	for i := range allApps {
		app := &allApps[i]
		if displayName, ok := changeMap[app.AppID]; ok {
			if err := SetAppExtended(app, displayName, "appinfo", "common", "name_localized", "schinese"); err != nil {
				if err := SetAppExtended(app, displayName, "appinfo", "common", "name"); err != nil {
					slog.Error("Failed to set display name for app", "appid", app.AppID, "err", err)
				}
			}
			delete(changeMap, app.AppID) // Remove applied change
		}
	}

	for appid := range changeMap {
		slog.Warn("App not found, cannot change display name", "appid", appid)
	}

	marshaledData, err := appinfo.Marshal(allApps)
	if err != nil {
		return fmt.Errorf("failed to marshal appinfo: %w", err)
	}

	if err := os.WriteFile(savePath, marshaledData, 0644); err != nil {
		return fmt.Errorf("failed to write updated appinfo.vdf: %w", err)
	}

	return nil
}

func readLibraryChanges() ([]LibraryChange, error) {
	filePath := constants.LibraryChangesFile()
	file, err := os.Open(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []LibraryChange{}, nil // No file, no changes
		}
		return nil, fmt.Errorf("failed to open library changes file: %w", err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read library changes file: %w", err)
	}

	if len(data) == 0 {
		return []LibraryChange{}, nil
	}

	var changesSlice []LibraryChange
	if err := json.Unmarshal(data, &changesSlice); err != nil {
		slog.Warn("failed to unmarshal library changes, treating as empty.", "err", err)
		return []LibraryChange{}, nil
	}
	return changesSlice, nil
}

func mergeLibraryChanges(changes []LibraryChange) error {
	filePath := constants.LibraryChangesFile()

	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		return fmt.Errorf("failed to create directory for library changes: %w", err)
	}

	existingChangesMap := make(map[uint32]LibraryChange)
	file, err := os.Open(filePath)
	if err != nil {
		if !os.IsNotExist(err) {
			return fmt.Errorf("failed to open library changes file: %w", err)
		}
	} else {
		defer file.Close()
		data, err := io.ReadAll(file)
		if err != nil {
			return fmt.Errorf("failed to read library changes file: %w", err)
		}
		if len(data) > 0 {
			var changesSlice []LibraryChange
			if err := json.Unmarshal(data, &changesSlice); err != nil {
				slog.Warn("failed to unmarshal existing library changes, creating a new one.", "err", err)
			} else {
				for _, change := range changesSlice {
					existingChangesMap[change.AppID] = change
				}
			}
		}
	}

	for _, change := range changes {
		existingChangesMap[change.AppID] = change
	}

	mergedChanges := make([]LibraryChange, 0, len(existingChangesMap))
	for _, change := range existingChangesMap {
		mergedChanges = append(mergedChanges, change)
	}

	mergedData, err := json.MarshalIndent(mergedChanges, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal merged library changes: %w", err)
	}

	if err := os.WriteFile(filePath, mergedData, 0644); err != nil {
		return fmt.Errorf("failed to write merged library changes: %w", err)
	}

	return nil
}

// SetAppExtended safely sets a nested value in the AppInfo.Extended map.
func SetAppExtended(app *appinfo.AppInfo, value string, keys ...string) error {
	var current interface{} = app.Extended

	for i, key := range keys {
		if i == len(keys)-1 {
			if currentMap, ok := current.(map[string]interface{}); ok {
				currentMap[key] = value
				return nil
			} else {
				return fmt.Errorf("parent of final key '%s' is not a map", key)
			}
		}

		currentMap, ok := current.(map[string]interface{})
		if !ok {
			return fmt.Errorf("value is not a map at key '%s'", key)
		}

		next, exists := currentMap[key]
		if !exists || next == nil {
			next = make(map[string]interface{})
			currentMap[key] = next
		}
		current = next
	}
	return fmt.Errorf("keys slice cannot be empty")
}

// AccessAppExtended safely accesses nested values in the AppInfo.Extended map.
// It takes an AppInfo object and a sequence of keys to traverse the nested maps.
// It returns the final string value if found, otherwise an error.
func AccessAppExtended(app appinfo.AppInfo, keys ...string) (string, error) {
	var current interface{} = app.Extended
	for _, key := range keys {
		currentMap, ok := current.(map[string]interface{})
		if !ok {
			return "", fmt.Errorf("value is not a map, but %T, cannot access key %s", current, key)
		}
		value, exists := currentMap[key]
		if !exists {
			return "", fmt.Errorf("key '%s' not found", key)
		}
		current = value
	}

	finalValue, ok := current.(string)
	if !ok {
		return "", fmt.Errorf("final value is not a string, but %T", current)
	}

	return finalValue, nil
}

func filterWithInstallDir(app appinfo.AppInfo, index int, libraryFolders text.LibraryFoldersData) bool {
	// Safely access nested map data to prevent panics
	installDir, err := AccessAppExtended(app, "appinfo", "config", "installdir")
	if err != nil {
		return false
	}

	for _, folder := range libraryFolders.Folders {
		installPath := filepath.Join(folder.Path, "steamapps", "common", installDir)
		if _, err := os.Stat(installPath); err == nil {
			return true
		}
	}
	return false
}
