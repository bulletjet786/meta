package machine

import (
	"log/slog"
	"runtime"

	"github.com/denisbrodbeck/machineid"
	"github.com/google/uuid"
)

type Service struct {
	machineInfo Info
}

func NewService() (*Service, error) {
	service := &Service{}
	deviceId, err := machineid.ID()
	if err != nil {
		slog.Error("Get machine id failed", "err", err.Error())
		return nil, err
	}
	launchId := uuid.NewString()

	service.machineInfo = Info{
		DeviceId: deviceId,
		LaunchId: launchId,
		Os:       runtime.GOOS,
		Arch:     runtime.GOARCH,
	}
	slog.Info("New App with machine info", "machine", service.machineInfo)
	return service, nil
}

func (s *Service) Start() {

}

type Info struct {
	DeviceId string `json:"device_id"`
	LaunchId string `json:"launch_id"`
	Os       string `json:"os"`
	Arch     string `json:"arch"`
}

func (s *Service) GetMachineInfo() Info {
	return s.machineInfo
}
