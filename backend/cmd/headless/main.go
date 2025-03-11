package main

import (
	"runtime"

	"meta/backend/service/steam"
)

const defaultRemoteDebuggingUrl = "http://localhost:8080"

func main() {
	steamService := steam.NewService(steam.ServiceOptions{
		RemoteUrl: defaultRemoteDebuggingUrl,
		Os:        runtime.GOOS,
	})

	steamService.Start()
}
