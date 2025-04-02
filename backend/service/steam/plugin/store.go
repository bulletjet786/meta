package plugin

import (
	"bytes"
	"context"
	_ "embed"
	"log/slog"
	"net/url"
	"reflect"
	"strings"
	"text/template"

	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/json"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"
)

const (
	storeHost       = "store.steampowered.com"
	communityHost   = "steamcommunity.com"
	xianYuDanJiHost = "www.xianyudanji.net"
	kkyxHost        = "www.kkyx.net"
	xbGameHost      = "www.xbgame.net"

	extensionCommunity = "community"
	extensionStore     = "store"

	storeAppUrlPrefix          = "/app/"
	crystalStoreJsCodeTemplate = `
	async function _crystalImport() {
		try {
			const crystal = await import("{{ .CrystalUrl }}");
			crystal.run("{{ .Extension }}", {{ .Options }});
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
	Extension  string
	Options    string
}

type SteamExtensionInjector struct {
}

const (
	crystalVersion = "0.1.3"
	crystalUrl     = "https://package.hulu.deckz.fun/crystal/" + crystalVersion + "/crystal.es.js"
)

func NewSteamLowestPriceStorePlugin() *SteamExtensionInjector {
	return &SteamExtensionInjector{}
}

func (p *SteamExtensionInjector) Name() string {
	return "LowestPriceStorePlugin"
}

func (p *SteamExtensionInjector) Init() error {
	return nil
}

func (p *SteamExtensionInjector) Run(chromeCtx context.Context) {
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

func (p *SteamExtensionInjector) injectLowestPricePanel(ctx context.Context, targetInfo *target.Info) {
	go func() {
		err := func() error {
			logger := slog.With(ctx, "plugin_name", p.Name())
			rawurl := targetInfo.URL
			logger = logger.With("url", rawurl)
			url, err := p.parseUrl(rawurl)
			if err != nil {
				return err
			}

			chromeCtx, _ := chromedp.NewContext(ctx, chromedp.WithTargetID(targetInfo.TargetID))
			// 为指定的页面设置bypass csp
			switch url.Host {
			case storeHost, xianYuDanJiHost, kkyxHost, xbGameHost, communityHost:
				if err := chromedp.Run(chromeCtx,
					page.SetBypassCSP(true),
				); err != nil {
					logger.Error("SetBypassCSP failed", "err", err)
					return err
				}
				slog.Info("SetBypassCSP success", "id", targetInfo.TargetID, "url", targetInfo.URL)
			}

			switch url.Host {
			case storeHost:
				if err := p.runStoreExtension(chromeCtx, url, logger); err != nil {
					return err
				}
			case communityHost:
				if err := p.runCommunityExtension(chromeCtx, url, logger); err != nil {
					return err
				}
			case xianYuDanJiHost, kkyxHost, xbGameHost:
				// 设置所有A标签的target属性为_self
				if err := chromedp.Run(chromeCtx, chromedp.Evaluate(allSelfTarget, nil)); err != nil {
					return err
				}
			}
			return nil
		}()
		if err != nil {
			slog.Error("Failed to inject", "url", targetInfo.URL, "error", err)
		}
	}()
}

func (p *SteamExtensionInjector) runStoreExtension(chromeCtx context.Context, url *url.URL, logger *slog.Logger) error {
	if strings.HasPrefix(url.Path, storeAppUrlPrefix) {
		logger.Info("Found store page, try to inject ...")
		// 注入 Crystal Store 相关的代码
		options := StoreExtensionOptions{
			GamePanel: &StoreGamePanelPluginOptions{
				UseDebugAppId: nil,
			},
			BlockTranslate: &BlockTranslatePluginOptions{
				ContentSelector: "#game_area_description",
			},
			SelectionTranslate: &SelectionTranslatePluginOptions{},
		}
		optionsStr, err := json.Marshal(&options)
		if err != nil {
			return err
		}
		slog.Info("Injected Crystal Store Extension", "options", optionsStr)
		if err := chromedp.Run(chromeCtx, chromedp.Evaluate(p.injectJsCode(extensionStore, string(optionsStr)), nil)); err != nil {
			return err
		}
	}
	return nil
}

func (p *SteamExtensionInjector) runCommunityExtension(chromeCtx context.Context, url *url.URL, logger *slog.Logger) error {
	// 注入 Crystal Community 相关的代码
	logger.Info("Found community page, try to inject ...")
	options := CommunityExtensionOptions{
		SelectionTranslate: &SelectionTranslatePluginOptions{},
	}
	optionsStr, err := json.Marshal(&options)
	if err != nil {
		return err
	}
	slog.Info("Injected Crystal Store Extension", "options", optionsStr)
	if err := chromedp.Run(chromeCtx, chromedp.Evaluate(p.injectJsCode(extensionCommunity, string(optionsStr)), nil)); err != nil {
		return err
	}
	return nil
}

func (p *SteamExtensionInjector) injectJsCode(extension string, options string) string {
	jsCodeTmpl, _ := template.New("lowestJsCode").Parse(crystalStoreJsCodeTemplate)
	var buf bytes.Buffer
	_ = jsCodeTmpl.Execute(&buf, lowestJsCodeTemplateValue{
		CrystalUrl: crystalUrl,
		Extension:  extension,
		Options:    options,
	})
	injectJsCode := buf.String()
	slog.Info("Inject js code", "code", injectJsCode)
	return injectJsCode
}

func (p *SteamExtensionInjector) parseUrl(rawurl string) (*url.URL, error) {
	// 解析url为URL对象
	url, err := url.Parse(rawurl)
	if err != nil {
		return nil, err
	}
	return url, nil
}

type CommunityExtensionOptions struct {
	SelectionTranslate *SelectionTranslatePluginOptions `json:"selectionTranslate"`
}

type StoreExtensionOptions struct {
	GamePanel          *StoreGamePanelPluginOptions     `json:"gamePanel"`
	BlockTranslate     *BlockTranslatePluginOptions     `json:"blockTranslate"`
	SelectionTranslate *SelectionTranslatePluginOptions `json:"selectionTranslate"`
}

type StoreGamePanelPluginOptions struct {
	UseDebugAppId    *string `json:"useDebugAppId"`
	UseDebugGameName *string `json:"useDebugGameName"`
	DeviceId         *string `json:"deviceId"`
}

type BlockTranslatePluginOptions struct {
	ContentSelector string `json:"contentSelector"`
}

type SelectionTranslatePluginOptions struct{}
