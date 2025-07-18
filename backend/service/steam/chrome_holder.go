package steam

import (
	"context"
	"fmt"
	"log/slog"
	"meta/backend/service/steam/common"
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

type ChromeHolder struct {
	remoteUrl string

	chromeCtx     context.Context
	chromeCancel  func()
	status        common.Status
	statusChannel chan common.Status
}

func NewChromeHolder(remoteUrl string) ChromeHolder {
	return ChromeHolder{
		remoteUrl:     remoteUrl,
		chromeCtx:     nil,
		chromeCancel:  nil,
		status:        common.Status{State: StatusDisconnected},
		statusChannel: make(chan common.Status, 100),
	}
}

func (c *ChromeHolder) ChromeCancel() {}

func (c *ChromeHolder) cleanChromeContext() {
	if c.chromeCtx != nil {
		c.chromeCancel()
	}
	c.chromeCtx = nil
	c.chromeCancel = nil
}

func (c *ChromeHolder) updateStatus(status common.Status) {
	slog.Info("Updating steam status", "status", status)

	c.status = status
	c.statusChannel <- c.status
}

func (c *ChromeHolder) connectionAvailable() bool {
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

func (c *ChromeHolder) sharedJsContextTargetId(ctx context.Context) (target.ID, error) {
	if ctx == nil {
		return "", fmt.Errorf("no available chrome ctx")
	}

	targets, err := chromedp.Targets(ctx)
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

func (c *ChromeHolder) makeConnection(id *target.ID) (context.Context, context.CancelFunc) {
	allocatorContext, _ := chromedp.NewRemoteAllocator(context.Background(), c.remoteUrl)

	// build context options
	var opts = []chromedp.ContextOption{
		//chromedp.WithDebugf(log.Printf),
	}
	if id != nil {
		opts = append(opts, chromedp.WithTargetID(*id))
	}
	return chromedp.NewContext(allocatorContext, opts...)
}

func (c *ChromeHolder) buildConnection() error {
	tempChromeCtx, _ := c.makeConnection(nil)
	sharedJsContextTargetId, err := c.sharedJsContextTargetId(tempChromeCtx)
	if err != nil {
		return err
	}

	slog.Info("sharedJsContextTargetId found", "id", sharedJsContextTargetId)
	c.chromeCtx, c.chromeCancel = c.makeConnection(&sharedJsContextTargetId)
	if err := chromedp.Run(c.chromeCtx,
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

func (c *ChromeHolder) Status() common.Status {
	return c.status
}

func (c *ChromeHolder) StatusEvent() <-chan common.Status {
	return c.statusChannel
}

func (c *ChromeHolder) watchdog() {
	err := c.buildConnection()
	if err != nil {
		slog.Error("Init build steam connection failed", "err", err)
	}

	ticker := time.NewTicker(5 * time.Second)
	for {
		<-ticker.C
		needRebuild := false
		if !c.connectionAvailable() {
			c.cleanChromeContext()
			c.updateStatus(common.Status{State: StatusDisconnected})
			needRebuild = true
		} else {
			c.updateStatus(common.Status{State: StatusConnected})
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
