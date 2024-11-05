package http

import "testing"

func TestEmbedServer_RunServer(t *testing.T) {
	tests := []struct {
		name string
	}{
		{
			name: "embed server",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &EmbedServer{}
			s.RunServer()
		})
	}
}

func TestEmbedServer_OAuth2(t *testing.T) {
	tests := []struct {
		name string
	}{
		{
			name: "embed server",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &EmbedServer{}
			s.RunServer()
		})
	}
}
