package translate

import (
	"log/slog"

	"meta/backend/integration"

	tmt "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/tmt/v20180321"
	"resty.dev/v3"
)

type TranslateService struct {
	tencentCloudClient *tmt.Client
	xiaoNiuClient *resty.Client
}

func NewTranslateService() (*TranslateService, error) {
	return &TranslateService{
		tencentCloudClient: integration.NewTencentCloudClient(),
		xiaoNiuClient: integration.NewXiaoNiuClient(),
	}, nil
}


func (s *TranslateService) Translate(text string) (string, error) {
	return s.translateForXiaoNiu(text)
}

func (s *TranslateService) translateForTencentCloud(text string) (string, error) {
    request := tmt.NewTextTranslateRequest()
	request.ProjectId = &integration.ProjectId

	request.SourceText = &text
	source := "auto"
	request.Source = &source
	target := "zh"
	request.Target = &target
    response, err := s.tencentCloudClient.TextTranslate(request)
    if err != nil {
		slog.Error("translate failed", "request", request, "err", err)
		return "", nil
    }
	return *response.Response.TargetText, nil
}

func (s *TranslateService) translateForXiaoNiu(text string) (string, error) {
	request := XiaoNiuTranslateRequest{
		From: "auto",
		To: "zh",
		ApiKey: integration.XiaoNiuApiKey,
		SrcText: text,
	}
	response := &XiaoNiuTranslateResponse{}
	_, err := s.xiaoNiuClient.R().
		SetBody(request).
		SetResult(response).
		Post("/NiuTransServer/translation")
	if err != nil {
		slog.Error("translate failed", "request", request, "err", err)
		return "", nil
	}
	if response.ErrorCode != "" {
		slog.Error("translate failed", "request", request, "err", response.ErrorMsg)
		return "", nil
	}
	return response.TargetText, nil
}

type XiaoNiuTranslateRequest struct {
	From string `json:"from"`
	To string `json:"to"`
	ApiKey string `json:"apikey"`
	SrcText string `json:"src_text"`
}

type XiaoNiuTranslateResponse struct {
	ErrorCode string `json:"error_code"`
	ErrorMsg string `json:"error_msg"`
	TargetText string `json:"tgt_text"`
	From string `json:"from"`
	To string `json:"to"`
}
