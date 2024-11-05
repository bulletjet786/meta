package plugin

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"log/slog"
	"net/url"
	"reflect"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/target"
	"github.com/chromedp/chromedp"

	"meta/backend/service/http"
	"meta/backend/service/machine"
	"meta/backend/service/setting"
)

const (
	storeHost       = "store.steampowered.com"
	communityHost   = "steamcommunity.com"
	xianYuDanJiHost = "www.xianyudanji.ai"
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
	bypassAgeValidation = `
	document.cookie = "wants_mature_content=1; domain=store.steampowered.com; path=/; expires=Fri, 01 Jan 9999 00:00:00 UTC; secure";
	document.cookie = "lastagecheckage=1-January-1995; domain=store.steampowered.com; path=/; expires=Fri, 01 Jan 9999 00:00:00 UTC; secure";
	document.cookie = "birthtime=788914801; domain=store.steampowered.com; path=/; expires=Fri, 01 Jan 9999 00:00:00 UTC; secure";
	`
)

type lowestJsCodeTemplateValue struct {
	CrystalUrl string
	Extension  string
	Options    string
}

type SteamExtensionInjector struct {
	machineInfo machine.Info
	getSetting  func() setting.Setting
}

func NewSteamExtensionInjector(machineInfo machine.Info, getSettingFunc func() setting.Setting) *SteamExtensionInjector {
	return &SteamExtensionInjector{
		machineInfo: machineInfo,
		getSetting:  getSettingFunc,
	}
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
	// 从商店页面进入时，如果是中国大陆地区，我们总是 跳过年龄验证
	if p.machineInfo.LanguageTag.Language == "zh" && p.machineInfo.LanguageTag.Region == "CN" {
		if err := chromedp.Run(chromeCtx, chromedp.Evaluate(bypassAgeValidation, nil)); err != nil {
			logger.Error("BypassAgeValidation failed", "err", err)
		}
	}

	// 商店游戏详情页
	var gamePanel *StoreGamePanelPluginOptions = nil
	if p.machineInfo.LanguageTag.Language == "zh" && p.machineInfo.LanguageTag.Region == "CN" {
		gamePanel = &StoreGamePanelPluginOptions{}
	}
	if strings.HasPrefix(url.Path, storeAppUrlPrefix) {
		logger.Info("Found store page, try to inject ...")
		// 注入 Crystal Store 相关的代码
		options := StoreExtensionOptions{
			GamePanel: gamePanel,
			BlockTranslate: &BlockTranslatePluginOptions{
				TargetLanguage: p.getSetting().Translate.TargetLanguage,
				Provider:       p.getSetting().Translate.Provider,
			},
			SelectionTranslate: &SelectionTranslatePluginOptions{
				TargetLanguage: p.getSetting().Translate.TargetLanguage,
				Provider:       p.getSetting().Translate.Provider,
			},
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
		SelectionTranslate: &SelectionTranslatePluginOptions{
			TargetLanguage: p.getSetting().Translate.TargetLanguage,
		},
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
	crystalUrl := "http://" + http.ListenOn + "/crystal/crystal.es.js?utc=" + strconv.FormatInt(time.Now().Unix(), 10)
	slog.Info("Inject js code with crystal url", "url", crystalUrl)
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
	Debug    bool    `json:"debug"`
	DeviceId *string `json:"deviceId"`
}

type BlockTranslatePluginOptions struct {
	TargetLanguage string `json:"targetLanguage"`
	Provider       string `json:"provider"`
}

type SelectionTranslatePluginOptions struct {
	TargetLanguage string `json:"targetLanguage"`
	Provider       string `json:"provider"`
}
