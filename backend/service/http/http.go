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
	engine *gin.Engine

	options EmbedServerOptions
}

func NewEmbedServer(options EmbedServerOptions) *EmbedServer {
	engine := gin.Default()
	engine.Use(cors.Default())
	return &EmbedServer{
		engine:  engine,
		options: options,
	}
}

type EmbedServerOptions struct {
	CrystalFs *embed.FS
	BrowserFS *embed.FS
}

func (s *EmbedServer) embedServer() error {
	crystalSub, err := fs.Sub(s.options.CrystalFs, "crystal/dist/crystal")
	if err != nil {
		return err
	}
	browserSub, err := fs.Sub(s.options.BrowserFS, "browser/out")
	if err != nil {
		return err
	}
	s.engine.StaticFS("/crystal", http.FS(crystalSub))
	s.engine.StaticFS("/browser", http.FS(browserSub))

	if s.engine.Run(ListenOn) != nil {
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

func (s *EmbedServer) AddRouter(path string, handler gin.HandlerFunc) {
	s.engine.POST(path, handler)
}
