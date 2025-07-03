package user

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zalando/go-keyring"
	"resty.dev/v3"

	"meta/backend/constants"
	"meta/backend/infra"
)

const (
	serviceKey      = "fun.deckz.meta"
	refreshTokenKey = "refresh_token"
)

type Service struct {
	options ServiceOptions

	wailsCtx       context.Context
	Session        *types.Session
	supabaseClient *supabase.Client
}

type ServiceOptions struct {
}

func NewUserService(options ServiceOptions) *Service {
	supabaseClient := infra.MustSupabaseClient()
	service := &Service{
		options:        options,
		supabaseClient: supabaseClient,
	}
	refreshToken := LoadRefreshToken()
	if refreshToken != "" {
		session, err := supabaseClient.RefreshToken(refreshToken)
		if err != nil {
			slog.Error("RefreshToken failed", "err", err)
		} else {
			slog.Info("RefreshToken success", "session", session)
			service.Session = &session
			_ = SaveRefreshToken(session.RefreshToken)
		}
	}

	return service
}

func (s *Service) SignIn() {
	wailsruntime.BrowserOpenURL(s.wailsCtx, "http://localhost:15637/browser/user/auth/sign.html")
}

func (s *Service) SignOut() {
	s.Session = nil
	wailsruntime.EventsEmit(s.wailsCtx, constants.EventForUserLoginInfo, s.GetLoginInfo())
	_ = keyring.Delete(serviceKey, refreshTokenKey)
}

func (s *Service) SignOutEndpoint() string {
	return "/api/user/auth/sign_out"
}

func (s *Service) SignOutHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		s.SignOut()
		c.JSON(http.StatusOK, gin.H{
			"code":    0,
			"message": "Sign out successfully",
		})
	}
}

func (s *Service) UpdateSessionEndpoint() string {
	return "/api/user/auth/update_session"
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
		s.Session = &session
		wailsruntime.EventsEmit(s.wailsCtx, constants.EventForUserLoginInfo, s.GetLoginInfo())
		_ = SaveRefreshToken(session.RefreshToken)
		s.enableTokenAutoRefresh()
		c.JSON(http.StatusOK, gin.H{
			"code":    0,
			"message": "Session updated successfully",
		})
		return
	}
}

func (s *Service) GetLoginInfoEndpoint() string {
	return "/api/user/auth/get_login_info"
}

func (s *Service) GetLoginInfoHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		if s.Session == nil {
			c.JSON(http.StatusOK, LoginInfo{
				LoggedIn: false,
			})
			return
		}
		c.JSON(http.StatusOK, LoginInfo{
			LoggedIn:    true,
			Plan:        "free",
			AccessToken: s.Session.AccessToken,
		})
	}
}

func (s *Service) GetLoginInfo() LoginInfo {
	if s.Session == nil {
		return LoginInfo{
			LoggedIn: false,
		}
	}
	return LoginInfo{
		LoggedIn:    true,
		Plan:        "free",
		AccessToken: s.Session.AccessToken,
	}
}

func (s *Service) Start(wailsContext context.Context) {
	s.wailsCtx = wailsContext
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

func (s *Service) enableTokenAutoRefresh() {
	go func() {
		attempt := 0
		expiresAt := time.Now().Add(time.Duration(s.Session.ExpiresIn) * time.Second)

		for {
			sleepDuration := (time.Until(expiresAt) / 4) * 3
			if sleepDuration > 0 {
				time.Sleep(sleepDuration)
			}
			// NOTE: now we don't allow user to sign out.It is just for debugging.
			if s.Session == nil {
				continue
			}

			// Refresh the token
			newSession, err := s.supabaseClient.RefreshToken(s.Session.RefreshToken)
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
			s.Session = &newSession
			wailsruntime.EventsEmit(s.wailsCtx, constants.EventForUserLoginInfo, s.GetLoginInfo())
			_ = SaveRefreshToken(s.Session.RefreshToken)
			attempt = 0
			expiresAt = time.Now().Add(time.Duration(s.Session.ExpiresIn) * time.Second)
		}
	}()
}

func SaveRefreshToken(token string) error {
	if err := keyring.Set(serviceKey, refreshTokenKey, token); err != nil {
		slog.Error("Error saving refresh token to keyring: %v", err)
		return err
	}
	slog.Info("Refresh token saved to keyring")
	return nil
}

func LoadRefreshToken() string {
	secret, err := keyring.Get(serviceKey, refreshTokenKey)
	if err != nil {
		slog.Warn("Error loading refresh token from keyring: %v", err)
		return ""
	}
	return secret
}
