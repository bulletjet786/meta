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
	SteamMetaOAuthPrivateKey = `
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDJqU3yzKTfxnDT
YCezrnPHzEdpQyALFAjf26tRbCv5PBmxsQ4yvf3P5E5idCUBqnFBuPXqx0EvYWnL
JDOoH6Go/UaSZr7c5VKAI2NqpEGkPEYslhFXkYKq1kJePWsoAgMuSWaIuwUD2ii6
hjLj7q4G66MOp0OFgkvceMPCjiizMoc/TpOGhcPZU3r9syYuKPMyxBoIQDEPgQFw
gmOrRFrG5zHE1yfBvJ4IXMM4oHjcJ8mH9lUDwiCgGnQIEOZVbCUYjP1Ab0c7P8ND
K1DGIV5bchhnY28YaIuaFl/CgbDAgrYODIOfNBD8NldLUgsidITbc/doyibxUCoZ
m5DK7YmdAgMBAAECggEAAjcp9BDrfsnfU3Mq/H5eJ0PHRRDHuVdvAYaYSzy0/vf6
EEmxrj0IHNCVS9+ayHnm5KHzkbC+tpaLYv/y0VYHoKOnstQOJL8gOOgqn3FOh09i
NfswFZYzqUzRTde+5aGgB1InHjlvxKsQ53ux828b2lecYvzTcRQNYU6yV+DX8aAH
fO5pPfGI/ufhIsXxa1bixlyl59uBOe5mgdhLdELHxc9f40I6aivTb4PRxkWL88mD
kA8722Z0Ehg1s7ZBgDx46rXKHWOH1TcWE39M+0y/ZlSI+qySdO0ReG/V43DXLRch
fmdS6Z6JlO3Rmfg85+TmBorCGUYuJMHfPy8hbs4owQKBgQDt6uV0ScDIFtNTuVTh
wjT7G+EXXnfZshD4TzG9q2yiV7ATiTXMIH/axnUDFoATk1Ch3ZOR8eDkH835H1M+
74aPKpxHoGyCanxo+QEcs9SVmCc8bLi7FjqNztp1+kKW77mlO5wCHrjFc7Xzvrx+
w2UjduOVoP5vlqIzGtyOSPxkvwKBgQDY/PrWk/W3Vhm9FFcWdGC6fX3v/p1KDe0J
CvxGg1CY74S8leZzqmVvlKi220G8/PD8cICoiIZm+RaCDE+2KAonSWwmRdNmrwOa
yxj3adzkHOpkyy6RV66Pv2RUtMmMVDtYz03nkQhhDmdPtpjK5vOs+DJJl1dNELfr
Peac12ucowKBgCNLJ0K69ig4ipzu71KWNrnRhvCqiOj4a2AKj3xtg64JiAs93Ycs
gwr3ScBthA5jWiDI9+08jnoI5ctBBF5ftfxi+8/8Ulx+Y3pHBg01+CFA8wEZt8W5
JHKI7wt1Vo+BfG6wixIdcJeJ9MH114yOe+Bo8JXvzg7Lr8AZCgLpfNeNAoGAG2ho
7q2lvdCcU6u8DFQK28N6ItRQXchAhoHit61igs7OP1vXzghZ46wtW1t6hDqW3ev/
9Em6YEtaMncHooSQM8IsbPEo8LFujSDWOHogspeMa8rWSPmATRvpumFTi+wfyun0
dyl0m33MQt9XkVl2sgRvpaf+GPfho08gT/NN3m0CgYB7aD7opVx0aPr5nV1G2isD
wyM5JpCRoirf5jMPEGZgWOPism/CREgyIWWV8jZehY942SPJB2ERATClAoUIFDfe
scHwUyOY46Pj3sabPvuyr3ffy2bIefeO94Kxll9uXHgO7dn3FBv9rNEoF/s76x80
vMeH+/fUqhs59w99zUuWdg==
-----END PRIVATE KEY-----`
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