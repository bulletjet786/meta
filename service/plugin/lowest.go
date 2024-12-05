package plugin

import (
	"context"
	_ "embed"
	"fmt"
	"log/slog"
	"strconv"
	"strings"
	"time"

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

func (p *SteamLowestPriceStorePlugin) extractAppIdFromUrl(url string) (string, error) {
	parts := strings.Split(strings.TrimPrefix(url, storeUrlPrefix), "/")
	if len(parts) < 2 {
		return "", fmt.Errorf("invalid URL: %s", url)
	}
	appId := parts[0]
	if _, err := strconv.Atoi(appId); err != nil {
		return "", fmt.Errorf("invalid AppID: %s", appId)
	}
	return appId, nil
}

func (p *SteamLowestPriceStorePlugin) iso8601ToRegular(isoTime string) (string, error) {
	layout := "2006-01-02T15:04:05Z"
	t, err := time.Parse(layout, isoTime)
	if err != nil {
		return "", err
	}
	return t.Format("2006-01-02 15:04"), nil
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

	// Check if the page is already injected
	// TODO: EvaluateAsDevTools?
	var pageInjected bool
	if err := chromedp.Run(ctx,
		chromedp.Evaluate(`MetaLowestPriceStorePlugin.pageInjected()`, &pageInjected)); err != nil {
		return err
	}
	if pageInjected {
		return nil
	}

	logger.Info("Page not inject, start injecting ...")

	// Get game data from ITAD API
	itadApi := &client.ItadApi{}
	lookupResp, err := itadApi.LookupGame(appId)
	if err != nil {
		return err
	}
	if !lookupResp.Found {
		return nil
	}

	gameSlug := lookupResp.Game.Slug
	storeLowResp, err := itadApi.StoreLow([]string{lookupResp.Game.ID})
	if err != nil {
		return err
	}
	logger.Info("Injecting: get lowest price success", "response", storeLowResp)

	if len(storeLowResp.Lows) == 0 {
		return nil
	}

	low := storeLowResp.Lows[0]
	lowestTimeOutput, err := p.iso8601ToRegular(low.Timestamp)
	if err != nil {
		return err
	}
	logger.Info("Injecting: make lowest price inject data success")

	injectCode := fmt.Sprintf(`
		HuluLowestPriceExtension.injectLowestPricePanel("%s", %f, %d, "%s", "%s")
	`, appId, low.Price.Amount, low.Cut, lowestTimeOutput, gameSlug)
	if err := chromedp.Run(ctx, chromedp.Evaluate(injectCode, nil)); err != nil {
		return err
	}
	logger.Info("Injecting: inject to page success")
	logger.Info("End Injecting: success")

	return nil
}

type LowestPriceStoreExtension struct {
	AppId      string  `json:"appId"`
	Price      float64 `json:"price"`
	Cut        int     `json:"cut"`
	LowestTime string  `json:"lowestTime"`
	GameSlug   string  `json:"gameSlug"`
}
