package service

import (
	"log/slog"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
	"golang.org/x/net/context"

	"meta/backend/service/plugin"
)

const SteamControllerStatusDisconnected = "Disconnected"
const SteamControllerStatusConnected = "Connected"

type SteamPlugin interface {
	Name() string
	Init() error
	Run(chromeCtx context.Context)
	Stop()
}

type SteamController struct {
	remoteUrl    string
	chromeCtx    context.Context
	chromeCancel func()
	status 	     Status

	plugins []SteamPlugin
}

func NewSteamController(url string) *SteamController {
	return &SteamController{
		remoteUrl: url,
	}
}

func (s *SteamController) Init() error {
	s.plugins = []SteamPlugin{
		plugin.NewSteamLowestPriceStorePlugin(),
	}
	for _, p := range s.plugins {
		if err := p.Init(); err != nil {
			slog.Error("Init steam plugin failed", "name", p.Name(), "err", err)
		}
	}
	s.Run()
	return nil
}

func (s *SteamController) start() {
	s.chromeCtx, s.chromeCancel = chromedp.NewRemoteAllocator(context.Background(), s.remoteUrl)
	if err := chromedp.Run(s.chromeCtx,
		page.Enable(),
		runtime.Enable(),
		page.SetBypassCSP(true),
	); err != nil {
		slog.Error("Start chrome debugger config failed", "err", err)
	}
	for _, p := range s.plugins {
		go p.Run(s.chromeCtx)
	}
}

func (s *SteamController) Run() {
	// go func ()  {
	// 	for {
	// 	}
	// }()
	go func ()  {
		for {
			select {
			case <-s.chromeCtx.Done():
				for _, p := range s.plugins {
					p.Stop()
				}
				s.start()
			}
		}
	}()
}

func (a *SteamController) Status() Status {
	return Status{
		State: SteamControllerStatusDisconnected,
	}
}

type Status struct {
	State string `json:"state"`
}

