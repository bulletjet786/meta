package main

import (
	"context"
	"embed"
	"flag"
	"log/slog"
	"os"

	"github.com/energye/systray"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"meta/backend/constants"
	"meta/backend/service/event"
	"meta/backend/service/http"
	"meta/backend/service/machine"
	"meta/backend/service/setting"
	"meta/backend/service/steam"
	"meta/backend/service/steam/common"
	"meta/backend/service/steam/subscriber"
	"meta/backend/service/updater"
)

//go:embed crystal/dist/crystal
var crystalFs embed.FS

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/windows/icon.ico
var trayIcon []byte

const defaultRemoteDebuggingUrl = "http://localhost:8080"

func main() {

	slog.Info("Start meta", "version", constants.Version, "channel", constants.Channel)

	mode := flag.String("mode", constants.UserRunMode, "启动方式")
	flag.Parse()
	windowStartState := options.Normal
	startHidden := false
	if mode != nil && *mode == constants.AutoRunMode {
		windowStartState = options.Minimised
		startHidden = true
	}

	machineService, err := machine.NewService()
	if err != nil {
		slog.Error("Machine service init error", "err", err)
		os.Exit(1)
	}

	eventService, err := event.NewService(event.ServiceOptions{
		DeviceId: machineService.GetMachineInfo().DeviceId,
		LaunchId: machineService.GetMachineInfo().LaunchId,
	})
	if err != nil {
		slog.Error("Event service init error", "err", err)
		os.Exit(1)
	}

	settingService, err := setting.NewSettingService(setting.ServiceOptions{
		MachineLanguageTag: machineService.GetMachineInfo().LanguageTag,
	}, eventService)
	if err != nil {
		slog.Error("Setting service init error", "err", err)
		os.Exit(1)
	}

	embedHttpServer := http.NewEmbedServer(http.EmbedServerOptions{
		CrystalFs: &crystalFs,
	})
	embedHttpServer.RunServer()

	updaterService := updater.NewUpdaterService(machineService.GetMachineInfo().DeviceId)
	updaterService.Start()

	wailsStatusSubscriber := subscriber.NewWailsEventsStatusSubscriber()
	steamService := steam.NewService(steam.ServiceOptions{
		RemoteUrl:   defaultRemoteDebuggingUrl,
		MachineInfo: machineService.GetMachineInfo(),
		GetSettingFunc: func() setting.Setting {
			return settingService.GetSetting()
		},
		Subscriber: []common.StatusSubscriber{
			wailsStatusSubscriber.RuntimePub,
		},
	})
	trayManager := NewTrayManager(eventService)

	// Create application with options
	err = wails.Run(&options.App{
		Title:             "Steam Meta",
		Width:             800,
		Height:            600,
		WindowStartState:  windowStartState,
		StartHidden:       startHidden,
		HideWindowOnClose: true,
		DisableResize:     true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		Bind: []interface{}{
			machineService,
			steamService,
			settingService,
		},
		OnStartup: func(ctx context.Context) {
			machineService.Start()
			eventService.Start()
			wailsStatusSubscriber.Start(ctx)
			steamService.Start()
			trayManager.Start(ctx)

			eventService.Send(event.TypeForApp, event.SubTypeForAppStart, event.AppStartTypeEventPayload{
				Success:   true,
				Version:   constants.Version,
				MLanguage: machineService.GetMachineInfo().LanguageTag,
				Mode:      *mode,
			})
		},
		OnDomReady: func(ctx context.Context) {},
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			eventService.Send(event.TypeForApp, event.SubTypeForAppStop, event.EmptyPayload{})
			return false
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: constants.SingleInstanceLockUniqueId,
		},
	})
	if err != nil {
		slog.Error("Wails run error", "err", err)
		eventService.Send(event.TypeForApp, event.SubTypeForAppStart, event.AppStartTypeEventPayload{
			Success:   false,
			Version:   constants.Version,
			MLanguage: machineService.GetMachineInfo().LanguageTag,
			Reason:    err.Error(),
		})
		os.Exit(1)
	}
}

type TrayManager struct {
	context context.Context

	eventService *event.Service
}

func NewTrayManager(eventService *event.Service) *TrayManager {
	return &TrayManager{
		eventService: eventService,
	}
}

func (t *TrayManager) Start(context context.Context) {
	t.context = context

	go systray.Run(t.configTray, func() {})
}

func (t *TrayManager) configTray() {
	systray.SetIcon(trayIcon)
	systray.SetOnClick(func(menu systray.IMenu) {
		wailsruntime.WindowShow(t.context)
	})
	systray.SetOnDClick(func(menu systray.IMenu) {
		wailsruntime.WindowShow(t.context)
	})
	exit := systray.AddMenuItem("Exit", "")
	exit.Click(func() { os.Exit(0) })
}
