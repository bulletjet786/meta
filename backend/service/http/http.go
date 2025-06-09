package http

import (
	"embed"
	"io/fs"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const (
	ListenOn = "127.0.0.1:15637"
)

type EmbedServer struct {
	options EmbedServerOptions
}

func NewEmbedServer(options EmbedServerOptions) *EmbedServer {
	return &EmbedServer{
		options: options,
	}
}

type EmbedServerOptions struct {
	CrystalFs   *embed.FS
	AuthHandler gin.HandlerFunc
}

func (s *EmbedServer) embedServer() error {
	engine := gin.Default()
	engine.Use(cors.Default())
	crystalSub, err := fs.Sub(s.options.CrystalFs, "crystal/dist/crystal")
	if err != nil {
		return err
	}
	engine.StaticFS("/crystal", http.FS(crystalSub))
	engine.GET("/user/auth/callback", s.options.AuthHandler)

	if engine.Run(ListenOn) != nil {
		return err
	}
	return nil
}

func (s *EmbedServer) RunServer() {
	go func() {
		err := s.embedServer()
		if err != nil {
			slog.Error("Start embed server failed", "err", err)
			os.Exit(1)
		}
	}()
}
