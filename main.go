package main

import (
	"context"
	"embed"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"meta/backend/constants"
	"meta/backend/service/machine"
	"meta/backend/service/steam"
)

//go:embed all:frontend/dist
var assets embed.FS

const defaultRemoteDebuggingUrl = "http://localhost:8080"

func main() {

	// Create an instance of the app structure
	machineService := machine.NewService()
	steamService := steam.NewService()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "meta",
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
		},
		OnStartup: func(ctx context.Context) {
			machineService.Start(ctx)
			steamService.Start(ctx, steam.ServiceOptions{
				RemoteUrl: defaultRemoteDebuggingUrl,
				Os:        machineService.GetMachineInfo().Os,
			})
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: constants.SingleInstanceLockUniqueId,
		},
	})

	if err != nil {
		slog.Error("Wails run error: %s", err)
		os.Exit(1)
	}
}
