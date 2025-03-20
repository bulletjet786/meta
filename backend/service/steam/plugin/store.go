package plugin

import (
	"bytes"
	"context"
	_ "embed"
	"html/template"
	"log/slog"
	"net/url"
	"reflect"
	"strings"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
)

const (
	storeUrlHost    = "store.steampowered.com"
	XianYuDanJiHost = "www.xianyudanji.net"
	KKYXHost        = "www.kkyx.net"
	XbGameHost      = "www.xbgame.net"

	storeAppUrlPrefix          = "/app/"
	crystalStoreJsCodeTemplate = `
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
	allSelfTarget = `
	document.querySelectorAll('a[target="_blank"]').forEach(link => {
		link.setAttribute('target', '_self');
	  });
	`
)

type lowestJsCodeTemplateValue struct {
	CrystalUrl string
}

type SteamLowestPriceStorePlugin struct {
	lowestJsCode string
}

const (
	newCrystalUrl = "https://package.hulu.deckz.fun/crystal/0.1.1.alpha1/crystal.es.js"
)

func NewSteamLowestPriceStorePlugin() *SteamLowestPriceStorePlugin {
	jsCodeTmpl, _ := template.New("lowestJsCode").Parse(crystalStoreJsCodeTemplate)
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
			rawurl := targetInfo.URL
			logger = logger.With("url", rawurl)
			url, err := p.ParseUrl(rawurl)
			if err != nil {
				return err
			}

			storeCtx, _ := chromedp.NewContext(ctx, chromedp.WithTargetID(targetInfo.TargetID))
			// 为指定的页面设置bypass csp
			switch url.Host {
			case storeUrlHost, XianYuDanJiHost, KKYXHost, XbGameHost:
				if err := chromedp.Run(storeCtx,
					page.SetBypassCSP(true),
				); err != nil {
					logger.Error("SetBypassCSP failed", "err", err)
					return err
				}
				slog.Info("SetBypassCSP success", "id", targetInfo.TargetID, "url", targetInfo.URL)
			}

			if url.Host == storeUrlHost && strings.HasPrefix(url.Path, storeAppUrlPrefix) {
				logger.Info("Found store page, try to inject ...")
				// 注入 Crystal Store 相关的代码
				if err := chromedp.Run(storeCtx, chromedp.Evaluate(p.lowestJsCode, nil)); err != nil {
					return err
				}
				return nil
			}

			switch url.Host {
			case XianYuDanJiHost, KKYXHost, XbGameHost:
				logger.Info("Found store page, try to inject ...")
				// 设置所有A标签的target属性为_self
				if err := chromedp.Run(storeCtx, chromedp.Evaluate(allSelfTarget, nil)); err != nil {
					return err
				}
			}

			return nil
		}()
		if err != nil {
			slog.Error("Failed to inject lowest price panel", "url", targetInfo.URL, "error", err)
		}
	}()
}

func (p *SteamLowestPriceStorePlugin) ParseUrl(rawurl string) (*url.URL, error) {
	// 解析url为URL对象
	url, err := url.Parse(rawurl)
	if err != nil {
		return nil, err
	}
	return url, nil
}
