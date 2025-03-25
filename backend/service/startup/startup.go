package startup

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"golang.org/x/sys/windows/registry"
)

const (
	autostartKey = `Software\Microsoft\Windows\CurrentVersion\Run`
)

type StartUpService struct {
}

func NewStartUpService() (*StartUpService, error) {
	return &StartUpService{}, nil
}

func (s *StartUpService) Enable() error {
	// 向注册表中写入启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autostartKey, registry.WRITE)
	if err != nil {
		return err
	}
	defer key.Close()

	config := s.metaConfig()

	// 为路径添加引号（防止空格路径问题）
	value := fmt.Sprintf(`"%s"`, config.Exec)
	err = key.SetStringValue(config.Name, value)
	if err != nil {
		return err
	}
	return nil
}

func (s *StartUpService) Disable() error {
	// 删除注册表中的启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autostartKey, registry.WRITE)
	if err != nil {
		return err
	}
	defer key.Close()

	config := s.metaConfig()

	err = key.DeleteValue(config.Name)
	if err != nil {
		return err
	}

	return nil
}

func (s *StartUpService) Enabled() (bool, error) {
	// 检查注册表中是否有对应的启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autostartKey, registry.WRITE)
	if err != nil {
		return false, err
	}

	config := s.metaConfig()

	_, _, err = key.GetStringValue(config.Name)
	if errors.Is(err, registry.ErrNotExist) {
		return false, nil
	}
	if err != nil {
		return false, nil
	}

	return true, nil
}

func (s *StartUpService) metaConfig() AutostartConfig {
	exePath, _ := os.Executable()
	appDir := filepath.Dir(exePath)

	// TODO: exec -d
	return AutostartConfig{
		Name: "meta",
		Exec: exePath,
	}

}

type AutostartConfig struct {
	Name       string
	Exec       string
	WorkingDir string
}
