package event

type EmptyPayload struct{}

// app Events
const (
	TypeForApp          = "app"

	SubTypeForAppStart  = "start"
	SubTypeForAppStop   = "stop"
	SubTypeForAppUpdate = "update"
	SubTypeForAutoRun   = "autorun"
)

type AppStartTypeEventPayload struct {
	Mode    string `json:"mode"`
	Success bool   `json:"success"`

	Reason  string `json:"reason"` // 当失败时
}

const (
	AppAutoRunOperateEnable = "enable"
	AppAutoRunOperateDisable = "disable"
)

type AppAutoRunTypeEventPayload struct {
	Operate string   `json:"operate"`
	Success bool     `json:"success"`
	Reason  string   `json:"reason"`  // 当失败时
}

