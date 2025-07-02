package machine

import (
	"log/slog"
	"os"
	"runtime"

	"github.com/denisbrodbeck/machineid"
	"github.com/google/uuid"

	"meta/backend/constants"
)

type Service struct {
	machineInfo Info
}

func NewService() *Service {

	deviceId, err := machineid.ID()
	if err != nil {
		slog.Error("Get machine id failed", "err", err.Error())
		os.Exit(21)
		return nil
	}
	launchId := uuid.NewString()

	languageTag, err := FindLanguageTag()
	if err != nil {
		slog.Error("Find locale failed", "err", err.Error())
		os.Exit(21)
		return nil
	}

	workDir, err := os.Executable()
	if err != nil {
		slog.Error("Get work dir failed", "err", err.Error())
		os.Exit(21)
		return nil
	}

	service := &Service{
		machineInfo: Info{
			DeviceId: deviceId,
			LaunchId: launchId,
			Os:       runtime.GOOS,
			Arch:     runtime.GOARCH,
			WorkDir:  workDir,
			LanguageTag: IdentifyingLanguageTag{
				Language: (*languageTag).Language(),
				Script:   (*languageTag).Script(),
				Region:   (*languageTag).Region(),
			},
			Version: constants.Version,
		},
	}
	slog.Info("New App with machine info", "machine", service.machineInfo)
	return service
}

type Info struct {
	DeviceId    string                 `json:"device_id"`
	LaunchId    string                 `json:"launch_id"`
	Os          string                 `json:"os"`
	Arch        string                 `json:"arch"`
	WorkDir     string                 `json:"work_dir"`
	Country     string                 `json:"country"`
	LanguageTag IdentifyingLanguageTag `json:"language_tag"`
	Version     string                 `json:"version"`
}

type IdentifyingLanguageTag struct {
	Language string `json:"language"`
	Script   string `json:"script"`
	Region   string `json:"region"`
}

func (s *Service) GetMachineInfo() Info {
	return s.machineInfo
}

func (s *Service) Start() {

}
