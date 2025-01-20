package steam

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"sync"
	"time"

	"github.com/chromedp/cdproto/page"
	cdpruntime "github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
)

const (
	StatusDisconnected = "Disconnected"
	StatusConnected    = "Connected"
)

type Status struct {
	State string `json:"state"`
}

type ChromeHolder struct {
	remoteUrl string

	chromeCtxLock sync.RWMutex
	chromeCtx     context.Context
	chromeCancel  func()
	status        Status
	statusChannel chan Status
}

func NewChromeHolder(remoteUrl string) ChromeHolder {
	return ChromeHolder{
		remoteUrl:     remoteUrl,
		chromeCtx:     nil,
		chromeCancel:  nil,
		status:        Status{StatusDisconnected},
		statusChannel: make(chan Status, 100),
	}
}

func (c *ChromeHolder) ChromeCancel() {}

func (c *ChromeHolder) cleanChromeContext() {
	c.chromeCtxLock.Lock()
	defer c.chromeCtxLock.Unlock()

	if c.chromeCtx != nil {
		c.chromeCancel()
	}
	c.chromeCtx = nil
	c.chromeCancel = nil
}

func (c *ChromeHolder) updateStatus(status Status) {
	slog.Info("Updating steam status", "status", status)
	c.chromeCtxLock.Lock()
	defer c.chromeCtxLock.Unlock()

	c.status = status
	c.statusChannel <- c.status
}

func (c *ChromeHolder) connectionAvailable() bool {
	c.chromeCtxLock.RLock()
	defer c.chromeCtxLock.RUnlock()
	if c.chromeCtx == nil {
		return false
	}

	_, err := chromedp.Targets(c.chromeCtx)
	if err != nil {
		slog.Error("Get targets failed", "err", err)
		return false
	}
	return true
}

func (c *ChromeHolder) sharedJsContextTargetId() (target.ID, error) {
	c.chromeCtxLock.RLock()
	defer c.chromeCtxLock.RUnlock()
	if c.chromeCtx == nil {
		return "", fmt.Errorf("no available chrome ctx")
	}

	targets, err := chromedp.Targets(c.chromeCtx)
	if err != nil {
		slog.Error("Get targets failed", "err", err)
		return "", err
	}
	for _, t := range targets {
		if t.Title == "SharedJSContext" {
			return t.TargetID, nil
		}
	}
	return "", fmt.Errorf("no SharedJSContext target")
}

func (c *ChromeHolder) makeConnection() {
	c.chromeCtxLock.Lock()
	defer c.chromeCtxLock.Unlock()

	allocatorContext, _ := chromedp.NewRemoteAllocator(context.Background(), c.remoteUrl)

	// build context options
	var opts = []chromedp.ContextOption{
		chromedp.WithDebugf(log.Printf),
	}
	c.chromeCtx, c.chromeCancel = chromedp.NewContext(allocatorContext, opts...)
}

func (c *ChromeHolder) buildConnection() error {
	c.makeConnection()

	// init check connection
	if !c.connectionAvailable() {
		c.cleanChromeContext()
		return fmt.Errorf("steam connection check failed")
	}
	slog.Info("Steam connection checked", "url", c.remoteUrl)

	// init chrome connection configuration
	sharedJsContextTargetId, err := c.sharedJsContextTargetId()
	if err != nil {
		return err
	}

	// 2025/01/21 00:36:58 -> {"id":3,"method":"Target.createTarget","params":{"url":"about:blank"}}
	//2025/01/21 00:36:58 <- {"id":3,"error":{"code":-32000,"message":"Not supported"}}
	//2025/01/21 00:36:58 ERROR Start chrome debugger config failed err="Not supported (-32000)"
	//2025/01/21 00:36:58 ERROR Build steam connection failed err="Not supported (-32000)"
	if err := chromedp.Run(c.chromeCtx,
		target.ActivateTarget(sharedJsContextTargetId),
		page.Enable(),
		cdpruntime.Enable(),
		page.SetBypassCSP(true),
	); err != nil {
		c.cleanChromeContext()
		slog.Error("Start chrome debugger config failed", "err", err)
		return err
	}
	return nil
}

func (c *ChromeHolder) ChromeCtx() *context.Context {
	if c.status.State == StatusConnected {
		return &c.chromeCtx
	}
	return nil
}

func (c *ChromeHolder) Status() Status {
	return c.status
}

func (c *ChromeHolder) StatusEvent() <-chan Status {
	return c.statusChannel
}

func (c *ChromeHolder) watchdog() {
	err := c.buildConnection()
	if err != nil {
		slog.Error("Init build steam connection failed", "err", err)
	}

	ticker := time.NewTicker(5 * time.Second)
	for {
		t := <-ticker.C
		slog.Info("Steam connection watchdog ticked", "t", t)
		needRebuild := false
		if !c.connectionAvailable() {
			c.cleanChromeContext()
			c.updateStatus(Status{StatusDisconnected})
			needRebuild = true
		} else {
			c.updateStatus(Status{StatusConnected})
		}
		if needRebuild {
			if err := c.buildConnection(); err != nil {
				slog.Error("Build steam connection failed", "err", err)
			}
		}
	}
}

func (c *ChromeHolder) Run() {
	go c.watchdog()
}
