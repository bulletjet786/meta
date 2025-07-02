package event

import (
	"log/slog"
	"time"

	"github.com/supabase-community/supabase-go"

	"meta/backend/constants"
	"meta/backend/integration"
	"meta/backend/service/machine"
)

var collector *collector = &collector{}

type collector struct {
	DeviceId string
	LaunchId string

	client *supabase.Client
}

func Init(deviceId string, launchId string) {
	collector.DeviceId = deviceId
	collector.LaunchId = launchId
	collector.client = integration.MustSupabaseClient()
}

func E(eType string, subType string, payload any) {
	if (collector == nil || collector.DeviceId == "" || collector.LaunchId == "" || collector.client == nil) {
		slog.Warn("collector not initialized")
		return
	}
	go func() {
		event := event{
			DeviceId:  s.options.DeviceId,
			LaunchId:  s.options.LaunchId,
			Type:      eType,
			SubType:   subType,
			Payload:   payload,
			CreatedAt: time.Now(),
		}
		_, _, err := s.client.From("event").Insert(event, false, "", "minimal", "").Execute()
		if err != nil {
			slog.Warn("E event failed", "err", err)
		}
	}()
}

func P(machineInfo machine.Info, autoRun bool, channel string) {
	if (collector == nil || collector.DeviceId == "" || collector.LaunchId == "" || collector.client == nil) {
		slog.Warn("collector not initialized")
		return
	}
	go func() {
		info := DeviceInfoModel{
			DeviceId: s.options.DeviceId,
			Info: DeviceInfo{
				MachineInfo: MachineInfo{
					Os:      machineInfo.Os,
					Arch:    machineInfo.Arch,
					Channel: channel,
					Version: constants.Version,
					AutoRun: autoRun,
					Country: machineInfo.Country,
					LanguageTag: IdentifyingLanguageTag{
						Language: machineInfo.LanguageTag.Language,
						Script:   machineInfo.LanguageTag.Script,
						Region:   machineInfo.LanguageTag.Region,
					},
				},
			},
		}
		result := s.client.Rpc("collect_device_info", "", map[string]any{
			"p_device_id": s.options.DeviceId,
			"p_info":      info,
		})
		slog.Info("upsert device info", "info", info, "result", result)
	}()
}

type event struct {
	DeviceId  string    `json:"device_id"`
	LaunchId  string    `json:"launch_id"`
	Type      string    `json:"type"`
	SubType   string    `json:"sub_type"`
	Payload   any       `json:"payload"`
	CreatedAt time.Time `json:"created_at"`
}

type DeviceInfoModel struct {
	DeviceId string     `json:"device_id"`
	Info     DeviceInfo `json:"info"`
}

type DeviceInfo struct {
	MachineInfo MachineInfo `json:"machine_info"`
}

type MachineInfo struct {
	Os          string                 `json:"os"`
	Arch        string                 `json:"arch"`
	Channel     string                 `json:"channel"`
	Version     string                 `json:"version"`
	AutoRun     bool                   `json:"auto_run"`
	Country     string                 `json:"country"`
	LanguageTag IdentifyingLanguageTag `json:"language_tag"`
}

type IdentifyingLanguageTag struct {
	Language string `json:"language"`
	Script   string `json:"script"`
	Region   string `json:"region"`
}
