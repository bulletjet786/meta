package event

type EmptyPayload struct{}

// app Events
const (
	TypeForApp          = "app"
	SubTypeForAppStart  = "start"
	SubTypeForAppStop   = "stop"
	SubTypeForAppUpdate = "update"
)

type AppStartTypeEventPayload struct {
	Success bool   `json:"success"`
	Reason  string `json:"reason"`
}
