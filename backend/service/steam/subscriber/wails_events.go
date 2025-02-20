package subscriber

import (
	"context"
	"meta/backend/service/steam/common"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"meta/backend/constants"
)

type WailsEventsStatusSubscriber struct {
	wailsCtx context.Context
}

func NewWailsEventsStatusSubscriber(wailsCtx context.Context) *WailsEventsStatusSubscriber {
	return &WailsEventsStatusSubscriber{
		wailsCtx: wailsCtx,
	}
}

func (s *WailsEventsStatusSubscriber) RuntimePub(status common.Status) {
	runtime.EventsEmit(s.wailsCtx, constants.EventForStatusChange, status)
}
