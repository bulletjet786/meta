package main

import (
	"embed"
	"log/slog"
	"meta/backend/constants"
	"meta/backend/service/machine"
	"meta/backend/service/steam"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

const defaultRemoteDebuggingUrl = "https://127.0..0.11:8080"

func main() {

	// Create an instance of the app structure
	app := NewApp()
	machineService := machine.NewService()
	steamService := steam.NewService(steam.ServiceOptions{
		RemoteUrl: defaultRemoteDebuggingUrl,
		Os:        machineService.GetMachineInfo().Os,
	})

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "meta",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			machineService,
			steamService,
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: constants.SingleInstanceLockUniqueId,
		},
	})

	if err != nil {
		slog.Error("Wails run error: %s", err)
	}
}
