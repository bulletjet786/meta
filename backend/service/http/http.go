package http

import (
	"embed"
	"github.com/gin-contrib/cors"
	"io/fs"
	"log/slog"
	"os"

	//"embed"
	"net/http"
	"net/http/httputil"
	"strings"

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
	CrystalFs *embed.FS
}

func (s *EmbedServer) embedServer() error {
	engine := gin.Default()
	engine.Use(cors.Default())
	crystalSub, err := fs.Sub(s.options.CrystalFs, "crystal/dist/crystal")
	if err != nil {
		return err
	}
	engine.StaticFS("/crystal", http.FS(crystalSub))

	proxy := engine.Group("/proxy")
	{
		translate := proxy.Group("/translate")
		{
			// 将会得到：
			// http://127.0.0.1:15637/proxy/translate/google//https://translate.google.${tld}/_/TranslateWebserverUi/data/batchexecute?${searchParams}
			googleProxy := httputil.ReverseProxy{
				Director: func(request *http.Request) {
					request.Host = "translate.google.com"
					request.URL.Scheme = "https"
					path, _ := strings.CutPrefix(request.URL.Path, "/proxy/translate/google//https://translate.google.com")
					request.URL.Path = path
				},
				ModifyResponse: func(response *http.Response) error {
					// 配置CORS Header
					response.Header.Add("Access-Control-Allow-Origin", "*")
					response.Header.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
					response.Header.Add("Access-Control-Allow-Headers", "DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,priority")
					return nil
				},
			}
			translate.Any("/google", func(context *gin.Context) {
				googleProxy.ServeHTTP(context.Writer, context.Request)
			})
		}
	}

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
