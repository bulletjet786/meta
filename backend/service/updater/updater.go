package updater

import (
	"log/slog"

	"meta/backend/integration"

	tmt "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/tmt/v20180321"
	"resty.dev/v3"
)

type UpdaterService struct {

}

func NewUpdaterService() (*UpdaterService, error) {
	return &UpdaterService{
	}, nil
}

func (s *UpdaterService) Update(text string) (string, error) {
	return s.translateForXiaoNiu(text)
}

func (s *UpdaterService) Fetcher() {
	return 
}

type metaFetcher struct {
	client *resty.Client
}

func NewMetaFetcher(deviceId string) *metaFetcher {
	client := resty.New().
		EnableGenerateCurlCmd().
		EnableTrace().
		SetDebugLogFormatter(resty.DebugLogJSONFormatter)
	return &metaFetcher{
		deviceId: deviceId,
		client: client,
	}
}

func (f *metaFetcher) Fetch(url string) (string, error) {
	// 我们不使用默认的地址，我们使用 Supabase 中定义的地址
	request := &LatestVersionRequest{
		DeviceId: f.deviceId,
		CurrentVersion: constants.Version,
	}

	_, err := f.client.R().
		SetBody(request).
		SetResult(response).
		SetHeader("X-Meta-Channel", constants.Channel).
		Post("https://joincyfzsuvolyklirho.supabase.co/functions/v1/version/latest")
}

type LatestVersionRequest struct {
	DeviceId string
	CurrentVersion string
}

