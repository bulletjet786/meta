package user

import (
	"fmt"
	"log/slog"
	"resty.dev/v3"

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

func (s *Service) UpgradePlanWithLicense(licenseKey string) {

}

type GumroadPurchase struct {
	Email       string `json:"email"`
	ProductName string `json:"product_name"`
	LicenseKey  string `json:"license_key"`
	Uses        int    `json:"uses"`
	Refunded    bool   `json:"refunded"`
	Disputed    bool   `json:"disputed"`
	OrderNumber int    `json:"order_number"`
	// 可以根据需要添加更多字段...
}

type GumroadResponse struct {
	Success  bool             `json:"success"`
	Purchase *GumroadPurchase `json:"purchase,omitempty"`
	Message  string           `json:"error,omitempty"` // 当 success == false 时可能返回 error 字段
}

// see:https://gumroad.com/help/article/76-license-keys
func verifyLicense(productID, licenseKey string) (*GumroadResponse, error) {
	client := resty.New()

	resp, err := client.R().
		SetFormData(map[string]string{
			"product_id":  productID,
			"license_key": licenseKey,
		}).
		SetResult(&GumroadResponse{}).
		Post("https://api.gumroad.com/v2/licenses/verify")

	if err != nil {
		return nil, err
	}

	result := resp.Result().(*GumroadResponse)

	// 检查是否失败（例如 404）
	if !result.Success || resp.StatusCode() == 404 {
		if result.Message == "" {
			result.Message = "License verification failed with status code: " + resp.Status()
		}
		return result, fmt.Errorf(result.Message)
	}

	return result, nil
}
