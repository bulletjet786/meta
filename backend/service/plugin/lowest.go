package plugin

import (
	"context"
	_ "embed"
	"log/slog"
	"strings"

	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
)

const (
	storeUrlPrefix     = "https://store.steampowered.com/app/"
	lowestJsCode = `
	async function _crystalImport() {
		try {
			const crystal = await import("$crystalModuleUrl");
			crystal.run({"useDebugAppId": null, "enableHistoryPriceCharts": true});
		} catch (error) {
			console.error('Dynamic import is not supported:', error);
		}
	}
	
	_crystalImport();
	`
)



type SteamLowestPriceStorePlugin struct {
	lowestJsCode string
}

func NewSteamLowestPriceStorePlugin() *SteamLowestPriceStorePlugin {
	return &SteamLowestPriceStorePlugin{
		lowestJsCode: lowestJsCode,
	}
}

func (p *SteamLowestPriceStorePlugin) Name() string {
	return "lowestPriceStorePlugin"
}

func (p *SteamLowestPriceStorePlugin) Init() error {
	return nil
}

func (p *SteamLowestPriceStorePlugin) Run(chromeCtx context.Context) {
	// just install listener to watch new target creation events
	chromedp.ListenTarget(chromeCtx, func(ev interface{}) {
		switch ev.(type) {
		case *target.EventTargetCreated:
			go func() {
				targetCreatedEvent := ev.(*target.EventTargetCreated)
				if err := p.injectLowestPricePanel(chromeCtx, targetCreatedEvent.TargetInfo); err != nil {
					slog.Warn("Inject LowestPriceStoreExtension Failed", "url", targetCreatedEvent.TargetInfo.URL, "err", err)
				}
			}()
		}
	})

}

func (p *SteamLowestPriceStorePlugin) Stop() {
}

func (p *SteamLowestPriceStorePlugin) injectLowestPricePanel(ctx context.Context, eventTargetCreated *target.Info) error {
	logger := slog.With(ctx, "plugin_name", p.Name())

	url := eventTargetCreated.URL
	if !strings.HasPrefix(url, storeUrlPrefix) {
		return nil
	}
	logger = logger.With("url", url)

	logger.Info("Found store page, try to inject ...")
	// Inject the JavaScript code
	if err := chromedp.Run(ctx, chromedp.Evaluate(p.lowestJsCode, nil)); err != nil {
		return err
	}
}

