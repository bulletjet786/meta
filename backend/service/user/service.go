package user

import (
	"fmt"
	"log/slog"
	"net/http"
	"os/exec"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
	"resty.dev/v3"
	"github.com/zalando/go-keyring"

	"meta/backend/integration"
	"meta/backend/service/event"
)

const (
	serviceKey = "fun.deckz.meta"
	refreshTokenKey = "refresh_token"
)

type Service struct {
	options ServiceOptions

	Session        *types.Session
	supabaseClient *supabase.Client
}

type ServiceOptions struct {
}

func NewUserService(options ServiceOptions) (*Service, error) {
	supabaseClient := integration.MustSupabaseClient()
	refreshToken := LoadRefreshToken()
	if refreshToken != "" {
		session, err := supabaseClient.Auth.RefreshToken(refreshToken)
		if err != nil {
			slog.Error("RefreshToken failed", "err", err)
		} else {
			slog.Info("RefreshToken success", "session", session)
			s.Session = &session
			SaveRefreshToken(session.RefreshToken)
		}
	}


	return &Service{
		options:        options,
		eventService:   eventService,
		supabaseClient: supabaseClient,
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
		var session types.Session
		if err := c.ShouldBindJSON(&session); err != nil {
			// 重定向到授权失败的页面
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "Invalid JSON payload",
			})
			return
		}
		slog.Info("update session with request", "session", session)

		s.supabaseClient.UpdateAuthSession(session)
		s.EnableTokenAutoRefresh(session)
		c.JSON(http.StatusOK, gin.H{
			"code":    0,
			"message": "Session updated successfully",
		})
		return
	}
}

func (s *Service) GetLoginInfo() LoginInfo {
	return LoginInfo{
		LoggedIn:    true,
		Plan:        "free",
		AccessToken: s.Session.AccessToken,
	}
}

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
	LoggedIn    bool   `json:"loggedIn"`
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

func (s *Service) EnableTokenAutoRefresh(session types.Session) {
	go func() {
		attempt := 0
		expiresAt := time.Now().Add(time.Duration(session.ExpiresIn) * time.Second)

		for {
			sleepDuration := (time.Until(expiresAt) / 4) * 3
			if sleepDuration > 0 {
				time.Sleep(sleepDuration)
			}

			// Refresh the token
			newSession, err := s.supabaseClient.RefreshToken(session.RefreshToken)
			if err != nil {
				attempt++
				if attempt <= 3 {
					slog.Info("Error refreshing token, retrying with exponential backoff: %v", err)
					time.Sleep(time.Duration(1<<attempt) * time.Second)
				} else {
					slog.Info("Error refreshing token, retrying every 30 seconds: %v", err)
					time.Sleep(30 * time.Second)
				}
				continue
			}

			// Update the session, reset the attempt counter, and update the expiresAt time
			s.supabaseClient.UpdateAuthSession(newSession)
			session = newSession
			s.Session = &newSession
			SaveRefreshToken(session.RefreshToken)
			attempt = 0
			expiresAt = time.Now().Add(time.Duration(session.ExpiresIn) * time.Second)
		}
	}()
}

func SaveRefreshToken(token string) error {
	return := keyring.Set(serviceKey, refreshTokenKey)
}

func LoadRefreshToken() string {
	secret, err := keyring.Get(serviceKey, refreshTokenKey)
    if err != nil {
        return ""
    }
	return string(secret)
}