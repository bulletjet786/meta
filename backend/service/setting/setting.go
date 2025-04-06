package setting

const SettingPath = "setting.yaml" // TODO: 调整设置文件地址

type Setting struct {
	LowestPrice LowestPriceSetting `yaml:"lowestPrice"` // 史低价格设置
	Translate TranslateSetting `yaml:"translate"`	// 翻译设置
}

type LowestPriceSetting struct {
    PriceTableCountrys []string `yaml:"priceTableCountrys"` // 价格表格的国家列表
}

type TranslateSetting struct {
	// 区域翻译
    AboutGame TranslateAboutGameSetting `yaml:"aboutGame"`

	// 划词翻译
	Selection TranslateSelectionSetting `yaml:"selection"`
}

type TranslateAboutGameSetting struct {
	Enabled bool `yaml:"enabled"`
}

const (
	TranslateProviderXiaoNiu = "XiaoNiu"
	TranslateProviderDeepL = "DeepL"
)

type TranslateSelectionSetting struct {
	Provider string `yaml:"provider"`
}

func DefaultSetting() *Setting {
    return &Setting{}
}

type SettingService struct {
    setting *Setting

	options SettingServiceOptions
}

type SettingServiceOptions struct {
    SettingPath string
}

func NewSettingService(options SettingServiceOptions) (*SettingService, error) {
    setting := &DefaultSetting{}
	// 如果设置文件不存在，则创建默认配置
	if _, err := os.Stat(options.SettingPath); os.IsNotExist(err) {
		// 创建默认配置
		data, err := yaml.Marshal(setting)
		if err != nil {
			return nil, err
		}
		if err := os.WriteFile(options.SettingPath, data, 0644); err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	// 否则从设置文件中读取配置
	if data, err := os.ReadFile(options.SettingPath); 
	if err != nil {
		return nil, err
	}
	if err := yaml.Unmarshal(data, setting); err != nil {
		return nil, err
	}

    return &SettingService{setting: setting, options: options}, nil
}

// 保存当前的设置
func (s *SettingService) save() error {
    data, err := yaml.Marshal(s.setting)
    if err != nil {
        return err
    }
    return os.WriteFile(SettingPath, data, 0644)
}

func (s *SettingService) UpdateSetting(setting *Setting) error {
    s.setting = setting
    return s.save()
}