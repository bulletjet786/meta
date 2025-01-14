package plugin

import "context"

type SteamPlugin interface {
	Name() string
	Init() error
	// Plugin must handler chrome cannel event
	// Run must be called multitimes with diffenert context
	Run(chromeCtx context.Context)
}
