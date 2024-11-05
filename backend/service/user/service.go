package user

import (
	"fmt"
	"log/slog"
	"net/http"
	"os/exec"
	"runtime"

	"github.com/gin-gonic/gin"
	"github.com/supabase-community/gotrue-go/types"
	"resty.dev/v3"

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
	err := s.OpenBrowser("http://localhost:15637/browser/user/auth/sign.html")
	if err != nil {
		slog.Error("OpenBrowser failed", "err", err)
		return
	}
}

func (s *Service) Auth() {

}

func (s *Service) UpdateSessionEndpoint() string {
	return "/api/user/auth/update_session"
}

func (s *Service) GetAccessToken() string {
	return s.Session.AccessToken
}

func (s *Service) UpdateSessionHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var session Session
		if err := c.ShouldBindJSON(&session); err != nil {
			// 重定向到授权失败的页面
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "Invalid JSON payload",
			})
			return
		}
		slog.Info("update session with request", "session", session)

		// 重定向到授权成功的页面
		//c.JSON(http.StatusOK, gin.H{
		//	"message": "Session updated successfully",
		//	"token":   authResult.AccessToken,
		//})

		return
	}
}

func (s *Service) GetLoginInfo() {
	return
}

// 1. 使用 隐式流
// 2. 在页面中发送 refresh_token 到wails中
// 3. 在 wails 中启动 refresh_token 并保存每次的session到内存中
// 4. 每次刷新时都保存到设置中
// 5. 暴露 access_token 给 crystal（或者是否可以暴露refresh_token给crystal）

func (s *Service) Start() {
	slog.Info("Starting user service")
}

func (s *Service) UpgradePlanWithLicense(licenseKey string) (err error) {
	_, err = verifyLicense("", licenseKey)
	if err != nil {
		slog.Error("verifyLicense failed", "err", err)
		return err
	}
	return nil
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

type LoginInfo struct {
	Logined     bool   `json:"logined"`
	Plan        string `json:"plan"`
	AccessToken string `json:"access_token"`
}

type Session struct {
	AccessToken   string `json:"access_token" binding:"required"`
	ExpiresIn     string `json:"expires_in" binding:"required"`
	ExpiresAt     string `json:"expires_at" binding:"required"`
	ProviderToken string `json:"provider_token" binding:"required"`
	RefreshToken  string `json:"refresh_token" binding:"required"`
	TokenType     string `json:"token_type" binding:"required"`
}

func (s *Service) OpenBrowser(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start", "", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	case "linux":
		cmd = "xdg-open"
		args = []string{url}
	default:
		return fmt.Errorf("unsupported platform")
	}

	return exec.Command(cmd, args...).Start()
}
