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
	"meta/backend/dependency"
	"meta/backend/event"
	"meta/backend/service/http"
	"meta/backend/service/machine"
	"meta/backend/service/setting"
	"meta/backend/service/steam"
	"meta/backend/service/steam/common"
	"meta/backend/service/steam/subscriber"
	"meta/backend/service/updater"
	"meta/backend/service/user"
)

//go:embed crystal/dist/crystal
var crystalFs embed.FS

//go:embed all:browser/out
var browserFs embed.FS

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/windows/icon.ico
var trayIcon []byte

const defaultRemoteDebuggingUrl = "http://localhost:8080"

func main() {

	dependency.InitLogger()
	slog.Info("Start meta", "version", constants.Version)

	mode := flag.String("mode", constants.UserRunMode, "启动方式")
	flag.Parse()
	windowStartState := options.Normal
	startHidden := false
	if mode != nil && *mode == constants.AutoRunMode {
		windowStartState = options.Minimised
		startHidden = true
	}

	machineService := machine.NewService()

	event.Init(machineService.GetMachineInfo().DeviceId, machineService.GetMachineInfo().LaunchId)

	settingService := setting.NewSettingService(setting.ServiceOptions{})

	userService := user.NewUserService(user.ServiceOptions{})

	embedHttpServer := http.NewEmbedServer(http.EmbedServerOptions{
		CrystalFs: &crystalFs,
		BrowserFS: &browserFs,
	})
	embedHttpServer.AddRouter(userService.SignOutEndpoint(), userService.SignOutHandler())
	embedHttpServer.AddRouter(userService.UpdateSessionEndpoint(), userService.UpdateSessionHandler())
	embedHttpServer.AddRouter(userService.GetLoginInfoEndpoint(), userService.GetLoginInfoHandler())
	embedHttpServer.RunServer()

	updaterService := updater.NewUpdaterService(
		machineService.GetMachineInfo().DeviceId,
		settingService.GetSetting().Regular.Channel)
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
	trayManager := NewTrayManager()

	// Create application with options
	err := wails.Run(&options.App{
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
			userService,
		},
		OnStartup: func(ctx context.Context) {
			wailsStatusSubscriber.Start(ctx)
			steamService.Start()
			userService.Start(ctx)
			trayManager.Start(ctx)

			event.E(event.TypeForApp, event.SubTypeForAppStart, event.AppStartTypeEventPayload{
				Success:   true,
				Version:   constants.Version,
				MLanguage: machineService.GetMachineInfo().LanguageTag,
				Mode:      *mode,
			})
			event.P(machineService.GetMachineInfo(), settingService.AutoRunEnabled(), settingService.GetSetting().Regular.Channel)
		},
		OnDomReady: func(ctx context.Context) {},
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			event.E(event.TypeForApp, event.SubTypeForAppStop, event.EmptyPayload{})
			return false
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: constants.SingleInstanceLockUniqueId,
		},
	})
	if err != nil {
		slog.Error("Wails run error", "err", err)
		event.E(event.TypeForApp, event.SubTypeForAppStart, event.AppStartTypeEventPayload{
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
}

func NewTrayManager() *TrayManager {
	return &TrayManager{}
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
