package setting

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

const defaultConfigYaml = `
translate:
  block:
    aboutGame: true
    storeReviews: true
    communityReviews: true
  selection:
    enabled: false
  provider: XiaoNiuFree
  targetLanguage: zh
`

func Test_DefaultSetting(t *testing.T) {
	tempDir := t.TempDir()
	filePath := tempDir + "/setting.yaml"
	settingService, err := NewSettingService(ServiceOptions{
		SettingPath: filePath,
	})
	assert.NoError(t, err)
	assert.Equal(t, settingService.GetSetting().Translate.Provider, TranslateProviderXiaoNiuFree)

	contentBytes, err := os.ReadFile(filePath)
	assert.NoError(t, err)
	content := string(contentBytes)
	assert.NotEqual(t, 0, len(content))
}

func Test_Save(t *testing.T) {
	tempDir := t.TempDir()
	filePath := tempDir + "/setting.yaml"
	os.WriteFile(filePath, []byte(defaultConfigYaml), 0644)
	settingService, err := NewSettingService(ServiceOptions{
		SettingPath: filePath,
	})
	assert.NoError(t, err)
	assert.Equal(t, settingService.GetSetting().Translate.Provider, TranslateProviderXiaoNiuFree)

	settingConfig := settingService.GetSetting()
	settingConfig.Translate.Provider = TranslateProviderDeepLFree
	settingService.UpdateSetting(&settingConfig)

	settingService2, err := NewSettingService(ServiceOptions{
		SettingPath: filePath,
	})
	assert.NoError(t, err)
	assert.Equal(t, settingService2.GetSetting().Translate.Provider, TranslateProviderDeepLFree)
}
