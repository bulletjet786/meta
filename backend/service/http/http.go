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
}

func (s *EmbedServer) embedServer() error {
	crystalSub, err := fs.Sub(s.options.CrystalFs, "crystal/dist")
	if err != nil {
		return err
	}
	// 遍历crystal/dist目录下的文件
	fs.WalkDir(crystalSub, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		slog.Info("Embed file", "path", path)
		return nil
	})
	s.engine.StaticFS("/", http.FS(crystalSub))

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
