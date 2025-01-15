package steam

import (
	"log/slog"
	"os"
	"sync"
	"time"

	"github.com/chromedp/cdproto/browser"
	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/chromedp"
	"golang.org/x/net/context"

	"meta/backend/constants"
	"meta/backend/service/steam/plugin"
)

type Service struct {
	remoteUrl string
	os        string
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
	s := &Service{
		remoteUrl: options.RemoteUrl,
		os:        options.Os,
	}
	s.plugins = []plugin.SteamPlugin{
		plugin.NewSteamLowestPriceStorePlugin(),
	}
	for _, p := range s.plugins {
		if err := p.Init(); err != nil {
			slog.Error("Init steam plugin failed", "name", p.Name(), "err", err)
		}
	}

	return s
}

func (s *Service) init() error {
	s.Run()
	return nil
}

func (s *Service) Run() {
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
			s.status = Status{
				State: StatusDisconnected,
			}
		} else {
			s.statusLock.Lock() // 写锁
			s.status = Status{
				State: StatusConnected,
			}
			s.statusLock.Unlock()
		}
	}
}

func (s *Service) startPlugins() {
	s.ctxLock.RLock() // 读锁
	ctx := s.chromeCtx
	s.ctxLock.RUnlock()

	for _, p := range s.plugins {

		go p.Run(ctx)
	}
}

func (s *Service) rebuildConnection() {
	s.ctxLock.Lock() // 写锁
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
	s.ctxLock.Lock() // 写锁
	defer s.ctxLock.Unlock()
	s.chromeCtx, s.chromeCancel = chromedp.NewRemoteAllocator(context.Background(), s.remoteUrl)
	if err := chromedp.Run(s.chromeCtx,
		page.Enable(),
		runtime.Enable(),
		page.SetBypassCSP(true),
	); err != nil {
		slog.Error("Start chrome debugger config failed", "err", err)
		s.chromeCtx = nil
		s.chromeCancel = nil
	}
}

func (s *Service) Status() Status {
	s.statusLock.RLock()         // 读锁
	defer s.statusLock.RUnlock() // 读锁

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

	if s.os == constants.OsLinux {
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
