package main

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/denisbrodbeck/machineid"
)

// App struct
type App struct {
	machineId string
	ctx context.Context
	// steamController *plugin.steamController
}

// NewApp creates a new App application struct
func NewApp() *App {
	machineId, err := machineid.ID()
	if err != nil {
		slog.Error("Get machine id failed", "err", err.Error())
		// os.Fatal(1)
	}
	slog.Info("Get machine id", "machineId", machineId)
	return &App{
		machineId: machineId,
		ctx: context.Background(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
