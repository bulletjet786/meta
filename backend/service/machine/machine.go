package machine

import (
	"log/slog"
	"os"
	"runtime"

	"github.com/denisbrodbeck/machineid"
)

type Service struct {
	machineInfo Info
}

func NewService() *Service {
	machineId, err := machineid.ID()
	if err != nil {
		slog.Error("Get machine id failed", "err", err.Error())
		os.Exit(1)
	}
	info := Info{
		Id:   machineId,
		Os:   runtime.GOOS,
		Arch: runtime.GOARCH,
	}
	slog.Info("New App with machine info", "machine", info)
	return &Service{machineInfo: info}
}

type Info struct {
	Id   string `json:"id"`
	Os   string `json:"os"`
	Arch string `json:"arch"`
}

func (s *Service) GetMachineInfo() Info {
	return s.machineInfo
}
