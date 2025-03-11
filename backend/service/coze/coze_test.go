package coze

import (
	"fmt"
	"testing"
)

func TestGenOAuthAccessToken(t *testing.T) {

	options := ServiceOptions{}
	service := NewService(options)
	service.Start()

	// Generate an OAuth access token
	sessionName := "testSession"
	tokenString := service.GenOAuthAccessToken(sessionName)

	fmt.Println(tokenString)
}