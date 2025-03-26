package startup

import (
	"errors"
	"fmt"
	"golang.org/x/sys/windows/registry"
	"os"
)

const (
	autorunKey = `Software\Microsoft\Windows\CurrentVersion\Run`
)

type Service struct {
}

func NewStartUpService() (*Service, error) {
	return &Service{}, nil
}

func (s *Service) Enable() error {
	// 向注册表中写入启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autorunKey, registry.WRITE)
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

func (s *Service) Disable() error {
	// 删除注册表中的启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autorunKey, registry.WRITE)
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

func (s *Service) Enabled() (bool, error) {
	// 检查注册表中是否有对应的启动项
	key, err := registry.OpenKey(registry.CURRENT_USER, autorunKey, registry.WRITE)
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

func (s *Service) metaConfig() AutostartConfig {
	exePath, _ := os.Executable()

	return AutostartConfig{
		Name: "SteamMeta",
		Exec: exePath + " --mode autorun",
	}
}

type AutostartConfig struct {
	Name       string
	Exec       string
	WorkingDir string
}
