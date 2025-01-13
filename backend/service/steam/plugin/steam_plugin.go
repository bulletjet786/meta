package plugin

import "context"

type SteamPlugin interface {
	Name() string
	Init() error
	Run(chromeCtx context.Context)
	Stop()
}
