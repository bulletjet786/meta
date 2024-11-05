package steam

import (
	"log/slog"
	"os"

	"meta/backend/service/machine"
	"meta/backend/service/setting"
	"meta/backend/service/steam/common"
	"meta/backend/service/steam/discovery"
	"meta/backend/service/steam/plugin"
)

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
