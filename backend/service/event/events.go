package event

import ()

// app Events
const (
	EventTypeForApp = "app"
	EventSubTypeForAppStart = "start"
	EventSubTypeForAppStop = "stop"
	EventSubTypeForAppUpdate = "update"
)

type AppStartTypeEventPayload struct {
	Success bool `json:"success"`
	Reason string `json:"reason"`
}
