package machine

import (
	"context"
	"log/slog"
	"os"
	"runtime"

	"github.com/denisbrodbeck/machineid"
)

type Service struct {
	ctx context.Context

	machineInfo Info
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Start(ctx context.Context) {
	s.ctx = ctx
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
}

type Info struct {
	Id   string `json:"id"`
	Os   string `json:"os"`
	Arch string `json:"arch"`
}

func (s *Service) GetMachineInfo() Info {
	return s.machineInfo
}
