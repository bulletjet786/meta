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
	"meta/backend/service/machine"
	"meta/backend/service/startup"
	"meta/backend/service/steam"
	"meta/backend/service/steam/common"
	"meta/backend/service/steam/subscriber"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/windows/icon.ico
var trayIcon []byte

const defaultRemoteDebuggingUrl = "http://localhost:8080"

func main() {

	mode := flag.String("mode", constants.UserRunMode, "启动方式")
	flag.Parse()
	windowStartState := options.Normal
	if mode != nil && *mode == constants.AutoRunMode {
		windowStartState = options.Minimised
	}

	trayManager := NewTrayManager()
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
	wailsStatusSubscriber := subscriber.NewWailsEventsStatusSubscriber()
	steamService := steam.NewService(steam.ServiceOptions{
		RemoteUrl: defaultRemoteDebuggingUrl,
		Os:        machineService.GetMachineInfo().Os,
		Subscriber: []common.StatusSubscriber{
			wailsStatusSubscriber.RuntimePub,
		},
	})
	startupService, err := startup.NewStartUpService()
	if err != nil {
		slog.Error("Startup service init error", "err", err)
		os.Exit(1)
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:            "Steam伴侣",
		Width:            1280,
		Height:           800,
		WindowStartState: windowStartState,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		DisableResize:    true,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		Bind: []interface{}{
			machineService,
			steamService,
			startupService,
		},
		OnStartup: func(ctx context.Context) {
			machineService.Start()
			eventService.Start()
			wailsStatusSubscriber.Start(ctx)
			steamService.Start()
			trayManager.Start(ctx)

			// Send app start Event: success
			eventService.Send(event.TypeForApp, event.SubTypeForAppStart, event.AppStartTypeEventPayload{
				Success: true,
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
		// Send app start event: failed
		eventService.Send(event.TypeForApp, event.SubTypeForAppStart, event.AppStartTypeEventPayload{
			Success: false,
			Reason:  err.Error(),
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

	systray.SetIcon(trayIcon)
	show := systray.AddMenuItem("打开", "")
	show.Click(func() { wailsruntime.WindowShow(t.context) })
	systray.AddSeparator()
	exit := systray.AddMenuItem("退出", "")
	exit.Click(func() { os.Exit(0) } )
}