package main

import (
	"runtime"

	"meta/backend/service/steam"
)

const defaultRemoteDebuggingUrl = "http://localhost:8080"

func main() {
	steamService := steam.NewService()

	steamService.Start(steam.ServiceOptions{
		RemoteUrl: defaultRemoteDebuggingUrl,
		Os:        runtime.GOOS,
	})
}
