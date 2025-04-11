package updater

import (
	"log/slog"

	"meta/backend/integration"

	tmt "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/tmt/v20180321"
	"resty.dev/v3"
)

const (
    versionUrl = "https://joincyfzsuvolyklirho.supabase.co/functions/v1/version/latest"

	// 使用腾讯云存储
	metaPublicUrl = "https://dl.deckz.fun/"
)

type UpdaterService struct {
	updater *selfupdate.Updater
}

func NewUpdaterService(deviceId string) (*UpdaterService, error) {
	updater := &selfupdate.Updater{
		CurrentVersion: constants.Version,
		ApiURL:         versionUrl,
		BinURL:         metaPublicUrl,
		DiffURL:        metaPublicUrl,
		Dir:            "selfupdate/",
		CmdName:        "meta",
		ForceCheck:     true,
		Requester:      NewMetaFetcher(deviceId, constants.VersionUrl),
		OnSuccessfulUpdate: func() {
			slog.Info("Update successful", "from", constants.Version, "to", u.Info.Version)
		},
	}

	return &UpdaterService{
		updater: updater,
	}, nil
}

func (s *UpdaterService) Start() {
	go s.updater.BackgroundRun()
}

type metaFetcher struct {
	deviceId string
	versionUrl string

	client *resty.Client
	defaultFetcher *selfupdate.HTTPRequester
}

func NewMetaFetcher(deviceId string, versionUrl string) *metaFetcher {
	client := resty.New().
		EnableGenerateCurlCmd().
		EnableTrace().
		SetDebugLogFormatter(resty.DebugLogJSONFormatter)
	return &metaFetcher{
		deviceId: deviceId,
		client: client,
		defaultFetcher: selfupdate.HTTPRequester{},
	}
}

func (f *metaFetcher) Fetch(url string) (io.ReadCloser, error) {
	if f.versionUrl != url {
		return f.defaultFetcher.Fetch(url)
	}

	// 我们不使用默认的地址，我们使用 Supabase 中定义的地址
	request := &LatestVersionRequest{
		DeviceId: f.deviceId,
		CurrentVersion: constants.Version,
	}

	res, err := f.client.R().
		SetBody(request).
		SetResult(response).
		SetHeader("X-Meta-Channel", constants.Channel).
		SetDoNotParseResponse().
		Post(versionUrl)
	
	return res, err
}

type LatestVersionRequest struct {
	DeviceId string
	CurrentVersion string
}

