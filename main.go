package main

import (
	"context"
	"embed"
	"log/slog"
	"meta/backend/service/translate"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"meta/backend/constants"
	"meta/backend/service/event"
	"meta/backend/service/machine"
	"meta/backend/service/steam"
	"meta/backend/service/steam/common"
	"meta/backend/service/steam/subscriber"
)

//go:embed all:frontend/dist
var assets embed.FS

const defaultRemoteDebuggingUrl = "http://localhost:8080"

func main() {

	// Create an instance of the app structure
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
	translateService, err := translate.NewTranslateService()
	if err != nil {
		slog.Error("Translate service init error", "err", err)
		os.Exit(1)
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "Steam伴侣",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		DisableResize:    true,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		Bind: []interface{}{
			machineService,
			steamService,
			translateService,
		},
		OnStartup: func(ctx context.Context) {
			machineService.Start()
			eventService.Start()
			wailsStatusSubscriber.Start(ctx)
			steamService.Start()

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
