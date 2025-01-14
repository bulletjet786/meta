package steam

import (
	"log/slog"
	plugin2 "meta/backend/service/steam/plugin"
	"os"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/chromedp"
	"golang.org/x/net/context"

	"meta/backend/constants"
	"meta/backend/service/steam/plugin"
)

type Service struct {
	remoteUrl    string
	chromeCtx    context.Context
	chromeCancel func()

	os      string
	plugins []plugin.SteamPlugin

	statusLock sync.Mutex
	status Status
}

type ServiceOptions struct {
	RemoteUrl string
	Os        string
}

func NewService(options ServiceOptions) *Service {
	return &Service{
		remoteUrl: options.RemoteUrl,
		os:        options.Os,
	}
}

func (s *Service) Init() error {
	s.plugins = []plugin.SteamPlugin{
		plugin2.NewSteamLowestPriceStorePlugin(),
	}
	for _, p := range s.plugins {
		if err := p.Init(); err != nil {
			slog.Error("Init steam plugin failed", "name", p.Name(), "err", err)
		}
	}
	s.Run()
	return nil
}

func (s *Service) start() {
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

func (s *Service) Run() {
	go func ()  {
		for {
			// 
		}
	}()
	go func() {
		for {
			
		}
	}()
}

func (s *Service) 

func (s *Service) Status() Status {
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
	StatusConnected = "Connected"
)

type Status struct {
	State string `json:"state"`
}
