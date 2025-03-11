package plugin

import (
	"bytes"
	"context"
	_ "embed"
	"html/template"
	"log/slog"
	"reflect"
	"strings"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
)

const (
	storeUrlPrefix       = "https://store.steampowered.com/"
	storeAppUrlPrefix    = "https://store.steampowered.com/app/"
	lowestJsCodeTemplate = `
	async function _crystalImport() {
		try {
			const crystal = await import("{{ .CrystalUrl }}");
			crystal.run({"useDebugAppId": null, "enableHistoryPriceCharts": true});
		} catch (error) {
			console.error('Dynamic import is not supported:', error);
		}
	}
	
	_crystalImport();
	`
)

type lowestJsCodeTemplateValue struct {
	CrystalUrl string
}

type SteamLowestPriceStorePlugin struct {
	lowestJsCode string
}

const (
	oldCrystalUrl = "https://package.hulu.deckz.fun/crystal/0.0.3.alpha2/crystal.es.js"
	newCrystalUrl = "https://package.hulu.deckz.fun/crystal/0.1.0/crystal.es.js"
)

func NewSteamLowestPriceStorePlugin() *SteamLowestPriceStorePlugin {
	jsCodeTmpl, _ := template.New("lowestJsCode").Parse(lowestJsCodeTemplate)
	var buf bytes.Buffer
	_ = jsCodeTmpl.Execute(&buf, lowestJsCodeTemplateValue{
		CrystalUrl: newCrystalUrl,
	})
	lowestJsCode := buf.String()

	return &SteamLowestPriceStorePlugin{
		lowestJsCode: lowestJsCode,
	}
}

func (p *SteamLowestPriceStorePlugin) Name() string {
	return "LowestPriceStorePlugin"
}

func (p *SteamLowestPriceStorePlugin) Init() error {
	return nil
}

func (p *SteamLowestPriceStorePlugin) Run(chromeCtx context.Context) {
	// just install listener to watch new target creation events
	// when chromeCtx cancelled, listening will exit
	chromedp.ListenTarget(chromeCtx, func(ev interface{}) {
		slog.Info("listened target event", "event", ev, "type", reflect.TypeOf(ev))
		switch event := ev.(type) {
		case *target.EventTargetCreated:
			slog.Info("listened EventTargetCreated target event", "event.TargetInfo", event.TargetInfo)
			p.injectLowestPricePanel(chromeCtx, event.TargetInfo)
		case *target.EventTargetInfoChanged:
			slog.Info("listened EventTargetInfoChanged target event", "event.TargetInfo", event.TargetInfo)
			p.injectLowestPricePanel(chromeCtx, event.TargetInfo)
		}
	})
}

func (p *SteamLowestPriceStorePlugin) injectLowestPricePanel(ctx context.Context, targetInfo *target.Info) {
	go func() {
		err := func() error {
			logger := slog.With(ctx, "plugin_name", p.Name())
			url := targetInfo.URL
			logger = logger.With("url", url)

			storeCtx, _ := chromedp.NewContext(ctx, chromedp.WithTargetID(targetInfo.TargetID))
			if strings.HasPrefix(url, storeUrlPrefix) {
				if err := chromedp.Run(storeCtx,
					page.SetBypassCSP(true),
				); err != nil {
					logger.Error("SetBypassCSP failed", "err", err)
					return err
				}
				slog.Info("SetBypassCSP success", "id", targetInfo.TargetID, "url", targetInfo.URL)
			}

			if !strings.HasPrefix(url, storeAppUrlPrefix) {
				return nil
			}

			logger.Info("Found store page, try to inject ...")
			// Inject the JavaScript code
			if err := chromedp.Run(storeCtx, chromedp.Evaluate(p.lowestJsCode, nil)); err != nil {
				return err
			}
			return nil
		}()
		if err != nil {
			slog.Error("Failed to inject lowest price panel", "url", targetInfo.URL, "error", err)
		}
	}()
}
