package coze

import (
	"math/rand"
	"crypto/rsa"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	SteamMetaOAuthAppId = "1165676882256"
	SteamMetaOAuthAud = "api.coze.cn"
	SteamMetaOAuthPrivateKey = ""
)

type Service struct {
	options ServiceOptions

	privateKey *rsa.PrivateKey
}

type ServiceOptions struct {}

func NewService(options ServiceOptions) *Service {
	return &Service{
		options: options,
	}
}

func (s *Service) Start() {
	s.privateKey, _ = jwt.ParseRSAPrivateKeyFromPEM([]byte(SteamMetaOAuthPrivateKey))
}

func (s *Service) GenOAuthAccessToken(sessionName string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, s.ClaimsForChat(sessionName))

	tokenString, _ := token.SignedString(s.privateKey) // Must
	return tokenString
}

func (s *Service) ClaimsForChat(sessionName string) jwt.MapClaims {
	return jwt.MapClaims{
		"iss": SteamMetaOAuthAppId,
		"aud": SteamMetaOAuthAud,
		"iat": time.Now().Add(-1*1*time.Minute).Unix(),
		"exp": time.Now().Add(1*time.Minute).Unix(),
		"jti": randStr(32),
		"session_name": randStr(32), // 现在我们总是新启动一个新的对话
	}
}

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func randStr(n int) string {
    b := make([]byte, n)
    for i := range b {
      b[i] = letters[rand.Intn(len(letters))]
    }
    return string(b)
}