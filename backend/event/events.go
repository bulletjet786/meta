package event

import "meta/backend/service/machine"

type EmptyPayload struct{}

// app Events
const (
	TypeForApp = "app"

	SubTypeForAppStart  = "start"
	SubTypeForAppStop   = "stop"
	SubTypeForAppUpdate = "update"
	SubTypeForAutoRun   = "autorun"
)

type AppStartTypeEventPayload struct {
	Mode      string                         `json:"mode"`
	Version   string                         `json:"version"`
	Success   bool                           `json:"success"`
	MLanguage machine.IdentifyingLanguageTag `json:"mLanguage"`

	Reason string `json:"reason"` // 当失败时
}

const (
	AppAutoRunOperateEnable  = "enable"
	AppAutoRunOperateDisable = "disable"
)

type AppAutoRunTypeEventPayload struct {
	Operate string `json:"operate"`
	Success bool   `json:"success"`
	Reason  string `json:"reason"` // 当失败时
}
