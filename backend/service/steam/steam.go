package steam

import (
	"log/slog"
	"os"
	"sync"
	"time"
	"context"

	"github.com/chromedp/cdproto/browser"
	"github.com/chromedp/cdproto/page"
	cdpruntime "github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/chromedp"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"meta/backend/constants"
	"meta/backend/service/steam/plugin"
)

type Service struct {
	ctx context.Context

	options ServiceOptions
	plugins   []plugin.SteamPlugin

	ctxLock      sync.RWMutex
	chromeCtx    context.Context
	chromeCancel func()

	status     Status
	statusLock sync.RWMutex
}

type ServiceOptions struct {
	RemoteUrl string
	Os        string
}

func NewService(options ServiceOptions) *Service {
	return &Service{}
}


func (s *Service) Start(ctx context.Context, options ServiceOptions) {
	s.ctx = ctx
	s.options = options

	s.plugins = []plugin.SteamPlugin{
		plugin.NewSteamLowestPriceStorePlugin(),
	}
	for _, p := range s.plugins {
		if err := p.Init(); err != nil {
			slog.Error("Init steam plugin failed", "name", p.Name(), "err", err)
			os.Exit(1)
		}
	}

	go s.watchdog()
	go s.startPlugins()
}

func (s *Service) watchdog() {
	c := time.NewTicker(5 * time.Second)
	for {
		<-c.C
		if err := browser.GetVersion(); err != nil {
			s.chromeCancel()
			s.rebuildConnection()
			s.startPlugins()
			s.updateStatus(Status{
				State: StatusDisconnected,
			})
		} else {
			s.updateStatus(Status{
				State: StatusConnected,
			})
		}
	}
}

func (s *Service) updateStatus(status Status) {
	s.statusLock.Lock()
	s.status = status
	wailsruntime.EventsEmit(s.ctx, constants.EventForStatusChange, status)
	s.statusLock.Unlock()
}

func (s *Service) startPlugins() {
	s.ctxLock.RLock()
	ctx := s.chromeCtx
	s.ctxLock.RUnlock()

	for _, p := range s.plugins {

		go p.Run(ctx)
	}
}

func (s *Service) rebuildConnection() {
	s.ctxLock.Lock()
	s.chromeCtx = nil
	s.chromeCancel = nil
	s.ctxLock.Unlock()
	// 尝试建立新的连接
	c := time.NewTicker(5 * time.Second)
	for {
		<-c.C
		s.buildConnection()
	}
}

func (s *Service) buildConnection() {
	s.ctxLock.Lock()
	defer s.ctxLock.Unlock()
	s.chromeCtx, s.chromeCancel = chromedp.NewRemoteAllocator(context.Background(), s.options.RemoteUrl)
	if err := chromedp.Run(s.chromeCtx,
		page.Enable(),
		cdpruntime.Enable(),
		page.SetBypassCSP(true),
	); err != nil {
		slog.Error("Start chrome debugger config failed", "err", err)
		s.chromeCtx = nil
		s.chromeCancel = nil
	}
}

func (s *Service) Status() Status {
	s.statusLock.RLock()
	defer s.statusLock.RUnlock()

	return Status{
		State: StatusDisconnected,
	}
}

func (s *Service) EnableSteamCEFRemoteDebugging() error {
	homePath, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	cefEnableRemoteDebugging := homePath + "/.steam/steam/.cef-enable-remote-debugging"

	if s.options.Os == constants.OsLinux {
		fileHandler, err := os.Create(cefEnableRemoteDebugging)
		if nil != err {
			return err
		}
		defer fileHandler.Close()
	}
	return nil
}

const (
	StatusDisconnected = "Disconnected"
	StatusConnected    = "Connected"
)

type Status struct {
	State string `json:"state"`
}
