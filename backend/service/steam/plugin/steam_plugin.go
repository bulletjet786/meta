package plugin

import "context"

type SteamPlugin interface {
	Name() string
	Init() error
	// Run must be called multi times with different context
	// Plugin must handler chrome cancel event
	Run(chromeCtx context.Context)
}

const (
	SubTypeForStore = "Store"
	SubTypeForCommunity = "Community"
)
