package subscriber

import (
	"context"

	"meta/backend/constants"
	"meta/backend/service/steam"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)


type WailsEventsStatusSubscriber struct {
	wailsCtx context.Context
}

func NewWailsEventsStatusSubscriber(wailsCtx context.Context) *WailsEventsStatusSubscriber {
	return &WailsEventsStatusSubscriber{
		wailsCtx: wailsCtx,
	}
}

func (s *WailsEventsStatusSubscriber) RuntimePub(status steam.Status) {
	runtime.EventsEmit(s.wailsCtx, constants.EventForStatusChange, status)
}