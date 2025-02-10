package steam

import (
	"context"
	"log/slog"
	"os"

	"meta/backend/constants"
	"meta/backend/service/steam/plugin"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Service struct {
	wailsCtx context.Context

	options ServiceOptions
	plugins []plugin.SteamPlugin

	chromeHolder ChromeHolder
}

type ServiceOptions struct {
	RemoteUrl string
	Os        string
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Start(ctx context.Context, options ServiceOptions) {
	s.wailsCtx = ctx
	s.options = options

	s.plugins = []plugin.SteamPlugin{
		plugin.NewSteamLowestPriceStorePlugin(),
	}
	for _, p := range s.plugins {
		if err := p.Init(); err != nil {
			slog.Error("Init steam plugin failed", "name", p.Name(), "err", err)
			os.Exit(1)
		}
	}
	s.chromeHolder = NewChromeHolder(options.RemoteUrl)
	s.chromeHolder.Run()
	s.startPlugins()
}

func (s *Service) startPlugins() {
	go func() {
		lastState := StatusDisconnected
		for status := range s.chromeHolder.statusChannel {
			slog.Info("Receive status", "status", status)

			runtime.EventsEmit(s.wailsCtx, constants.EventForStatusChange, status)

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

func (s *Service) Status() Status {
	return s.chromeHolder.Status()
}

func (s *Service) EnableSteamCEFRemoteDebugging() error {
	homePath, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	cefEnableRemoteDebugging := homePath + "/.steam/steam/.cef-enable-remote-debugging"

	switch s.options.Os {
	case constants.OsLinux:
		fileHandler, err := os.Create(cefEnableRemoteDebugging)
		if nil != err {
			return err
		}
		defer fileHandler.Close()
	case constants.OsWindows:
		// TODO: windows
		
	}
	return nil
}

const (
	LinuxCEFDebuggingFilePathName = ".cef-enable-remote-debugging"
	WindowsCEFDebuggingFileName   = ".cef-enable-debugging"
	WindowsCEFDebuggingFilePath   = "C:\\Program Files (x86)\\Steam"
)
