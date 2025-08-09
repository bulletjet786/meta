package setting

import (
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/samber/lo"
	"golang.org/x/sys/windows/registry"
	"gopkg.in/yaml.v3"

	"meta/backend/constants"
	"meta/backend/event"
	"meta/backend/service/machine"
)

const (
	autorunKey = `Software\Microsoft\Windows\CurrentVersion\Run`
)

var (
	defaultLanguage         = "en_US"
	supportedLanguageLabels = []LanguageLabel{
		{Language: "en_US", Label: "English"},
		{Language: "zh_CN", Label: "简体中文"},
	}
)

type ASetting struct {
	LowestPrice         LowestPriceSetting  `yaml:"lowestPrice"` // 史低价格设置
	BypassAgeValidation BypassAgeValidation `yaml:"bypassAgeValidation"`
}

type Setting struct {
	Translate TranslateSetting `yaml:"translate"` // 翻译设置

	Regular RegularSetting `yaml:"regular"`
}

type TranslateSetting struct {
	// 区块翻译
	Block BlockTranslateSetting `yaml:"block"`
	// 划词翻译
	Selection SelectionTranslateSetting `yaml:"selection"`
	// 供应商
	Provider string `yaml:"provider"`
	// 母语
	TargetLanguage string `yaml:"targetLanguage"`
	// DeepLBeta
	DeepLUnlocked bool `yaml:"deepUnlocked"`
}

type LowestPriceSetting struct {
	PriceTableCountries []string `yaml:"priceTableCountries"`
}

type BypassAgeValidation struct {
	Disable bool `yaml:"disable"`
}

const (
	TranslateProviderXiaoNiu = "XiaoNiu"
	TranslateProviderDeepL   = "DeepL"
	TranslateProviderBing    = "Bing"
)

var supportTranslateEngines = []string{
	TranslateProviderXiaoNiu,
	TranslateProviderBing,
	TranslateProviderDeepL,
	// TranslateProviderBingFree,
}

type SelectionTranslateSetting struct {
	Enabled bool `yaml:"enabled"`
}

type BlockTranslateSetting struct {
	AboutGame        bool `yaml:"aboutGame"`
	StoreReviews     bool `yaml:"storeReviews"`
	CommunityReviews bool `yaml:"communityReviews"`
}

type RegularSetting struct {
	Channel string           `yaml:"channel"`
	UI      RegularUiSetting `yaml:"ui"`
}

type RegularUiSetting struct {
	Language string `yaml:"language"`
}

func DefaultSetting() *Setting {
	return &Setting{
		Translate: TranslateSetting{
			Provider:       TranslateProviderBing,
			TargetLanguage: "en_US",
			Selection: SelectionTranslateSetting{
				Enabled: true,
			},
			Block: BlockTranslateSetting{
				AboutGame:        true,
				StoreReviews:     true,
				CommunityReviews: true,
			},
		},
		Regular: RegularSetting{
			Channel: constants.ChannelRelease,
			UI: RegularUiSetting{
				Language: defaultLanguage,
			},
		},
	}
}

func defaultSettingPath() string {
	appDataPath := os.Getenv("APPDATA")
	if appDataPath == "" {
		return ""
	}
	return appDataPath + "\\meta\\setting.yaml"
}

type Service struct {
	setting *Setting

	options ServiceOptions
}

type ServiceOptions struct {
	SettingPath string
}

func NewSettingService(options ServiceOptions) *Service {
	if options.SettingPath == "" {
		options.SettingPath = defaultSettingPath()
	}
	slog.Info("Setting path", "path", options.SettingPath)

	setting := DefaultSetting()
	// 如果设置文件不存在，则创建默认配置
	if _, err := os.Stat(options.SettingPath); os.IsNotExist(err) {
		// 创建默认配置
		data, err := yaml.Marshal(setting)
		if err != nil {
			slog.Error("Failed to marshal setting", "error", err)
			os.Exit(21)
		}
		// 获取父目录
		parentDir := filepath.Dir(options.SettingPath)

		// 检查并创建父目录（如果它不存在）
		if err := os.MkdirAll(parentDir, os.ModePerm); err != nil {
			slog.Error("Failed to create parent directory", "error", err)
			os.Exit(22)
		}
		if err := os.WriteFile(options.SettingPath, data, 0644); err != nil {
			slog.Error("Failed to write setting", "error", err)
			os.Exit(23)
		}
	} else if err != nil {
		slog.Error("Failed to stat setting", "error", err)
		os.Exit(24)
	}

	// 否则从设置文件中读取配置
	data, err := os.ReadFile(options.SettingPath)
	if err != nil {
		slog.Error("Failed to read setting", "error", err)
		os.Exit(25)
	}
	if err := yaml.Unmarshal(data, setting); err != nil {
		slog.Error("Failed to unmarshal setting", "error", err)
	}
	fillDefault(setting)
	slog.Info("Load setting", "setting", setting)
	return &Service{setting: setting, options: options}
}

// TODO: if need to updating, return true.Now the result is unused.
func fillDefault(setting *Setting) bool {
	update := false
	if !lo.Contains(supportTranslateEngines, setting.Translate.Provider) {
		setting.Translate.Provider = TranslateProviderBing
		update = true
	}
	if !lo.ContainsBy(supportedLanguageLabels, func(item LanguageLabel) bool {
		return item.Language == setting.Regular.UI.Language
	}) {
		setting.Regular.UI.Language = defaultLanguage
		update = true
	}
	if setting.Regular.Channel == "" {
		setting.Regular.Channel = constants.ChannelRelease
		update = true
	}
	return update
}

func computerRegularLanguageFromLanguageTag(languageTag *machine.IdentifyingLanguageTag) string {
	regularLanguage := languageTag.Language + "_" + languageTag.Region
	if !lo.ContainsBy(supportedLanguageLabels, func(item LanguageLabel) bool {
		return item.Language == regularLanguage
	}) {
		return defaultLanguage
	}

	return regularLanguage
}

// 保存当前的设置
func (s *Service) save() error {
	data, err := yaml.Marshal(s.setting)
	if err != nil {
		return err
	}
	return os.WriteFile(s.options.SettingPath, data, 0644)
}

func (s *Service) UpdateSetting(setting *Setting) error {
	s.setting = setting
	return s.save()
}

func (s *Service) GetSetting() Setting {
	return *s.setting
}

func (s *Service) SupportedLanguageLabels() []LanguageLabel {
	return supportedLanguageLabels
}

type LanguageLabel struct {
	Language string `yaml:"language"`
	Label    string `yaml:"label"`
}

func (s *Service) AutoRunEnable() error {
	// 向注册表中写入启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autorunKey, registry.WRITE)
	if err != nil {
		event.E(event.TypeForApp, event.SubTypeForAutoRun, event.AppAutoRunTypeEventPayload{
			Operate: event.AppAutoRunOperateEnable,
			Success: false,
			Reason:  err.Error(),
		})
		return err
	}
	defer key.Close()

	config := s.metaConfig()

	// 为路径添加引号（防止空格路径问题）
	value := fmt.Sprintf(`%s`, config.Exec)
	err = key.SetStringValue(config.Name, value)
	if err != nil {
		event.E(event.TypeForApp, event.SubTypeForAutoRun, event.AppAutoRunTypeEventPayload{
			Operate: event.AppAutoRunOperateEnable,
			Success: false,
			Reason:  err.Error(),
		})
		return err
	}
	event.E(event.TypeForApp, event.SubTypeForAutoRun, event.AppAutoRunTypeEventPayload{
		Operate: event.AppAutoRunOperateEnable,
		Success: true,
	})

	return nil
}

func (s *Service) AutoRunDisable() error {
	// 删除注册表中的启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autorunKey, registry.WRITE)
	if err != nil {
		event.E(event.TypeForApp, event.SubTypeForAutoRun, event.AppAutoRunTypeEventPayload{
			Operate: event.AppAutoRunOperateDisable,
			Success: false,
			Reason:  err.Error(),
		})
		return err
	}
	defer key.Close()

	config := s.metaConfig()

	err = key.DeleteValue(config.Name)
	if err != nil {
		event.E(event.TypeForApp, event.SubTypeForAutoRun, event.AppAutoRunTypeEventPayload{
			Operate: event.AppAutoRunOperateDisable,
			Success: false,
			Reason:  err.Error(),
		})
		return err
	}
	event.E(event.TypeForApp, event.SubTypeForAutoRun, event.AppAutoRunTypeEventPayload{
		Operate: event.AppAutoRunOperateDisable,
		Success: true,
	})

	return nil
}

func (s *Service) AutoRunEnabled() bool {
	// 检查注册表中是否有对应的启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autorunKey, registry.READ)
	if err != nil {
		return false
	}

	config := s.metaConfig()

	_, _, err = key.GetStringValue(config.Name)
	if errors.Is(err, registry.ErrNotExist) {
		return false
	}
	if err != nil {
		return false
	}

	return true
}

func (s *Service) metaConfig() AutostartConfig {
	exePath, _ := os.Executable()

	return AutostartConfig{
		Name: "SteamMeta",
		Exec: "\"" + exePath + "\"" + " --mode " + constants.AutoRunMode,
	}
}

type AutostartConfig struct {
	Name string
	Exec string
}
