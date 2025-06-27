package user

import (
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/supabase-community/gotrue-go/types"

	"meta/backend/service/event"
)

type Service struct {
	options ServiceOptions

	eventService *event.Service

	Session *types.Session
}

type ServiceOptions struct {
}

func NewUserService(options ServiceOptions, eventService *event.Service) (*Service, error) {

	return &Service{
		options:      options,
		eventService: eventService,
	}, nil

}

func (s *Service) SignIn() {

}

func (s *Service) Auth() {

}

func (s *Service) AuthCallbackEndpoint() string {
	return "/user/auth/callback"
}

func (s *Service) AuthHandler() gin.HandlerFunc {
	return func(context *gin.Context) {
		return
	}
}

func (s *Service) GetAccessToken() string {
	return s.Session.AccessToken
}

// 1. 使用 隐式流
// 2. 在页面中发送 refresh_token 到wails中
// 3. 在 wails 中启动 refresh_token 并保存每次的session到内存中
// 4. 每次刷新时都保存到设置中
// 5. 暴露 access_token 给 crystal（或者是否可以暴露refresh_token给crystal）

func (s *Service) Start() {
	slog.Info("Starting user service")
}
