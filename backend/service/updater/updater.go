package updater

import (
	"io"
	"log/slog"
	"meta/backend/integration"

	"meta/backend/constants"

	"github.com/sanbornm/go-selfupdate/selfupdate"
	"resty.dev/v3"
)

const (
	versionUrl = "/functions/v1/version/latest"
	cmdName    = "meta"
	// 使用腾讯云存储
	metaPublicUrl = "https://dl.deckz.fun/"
)

type UpdaterService struct {
	updater *selfupdate.Updater
}

func NewUpdaterService(deviceId string) *UpdaterService {
	updater := &selfupdate.Updater{
		CurrentVersion: constants.Version,
		ApiURL:         integration.SupabaseApiUrl + versionUrl + "/",
		BinURL:         metaPublicUrl,
		DiffURL:        metaPublicUrl,
		Dir:            "selfupdate/",
		CmdName:        cmdName,
		ForceCheck:     true,
		Requester:      newMetaFetcher(deviceId),
		OnSuccessfulUpdate: func() {
			slog.Info("Update successful", "from", constants.Version)
		},
	}

	return &UpdaterService{
		updater: updater,
	}
}

func (s *UpdaterService) Start() {
	go func() {
		err := s.updater.BackgroundRun()
		if err != nil {
			slog.Error("Start update background failed", "err", err)
		}
	}()
}

type metaFetcher struct {
	deviceId   string
	versionUrl string

	client         *resty.Client
	defaultFetcher *selfupdate.HTTPRequester
}

func newMetaFetcher(deviceId string) *metaFetcher {
	client := resty.New().
		EnableGenerateCurlCmd().
		EnableTrace().
		SetDebugLogFormatter(resty.DebugLogJSONFormatter).
		SetDebugLogCurlCmd(true).
		SetDebug(true)
	return &metaFetcher{
		deviceId:       deviceId,
		client:         client,
		defaultFetcher: &selfupdate.HTTPRequester{},
		versionUrl:     versionUrl,
	}
}

func (f *metaFetcher) windowsMetaVersionUrl() string {
	return integration.SupabaseApiUrl + f.versionUrl + "/" + cmdName + "/windows-amd64.json"
}

func (f *metaFetcher) Fetch(url string) (io.ReadCloser, error) {
	if f.windowsMetaVersionUrl() != url {
		return f.defaultFetcher.Fetch(url)
	}

	request := &LatestVersionRequest{
		DeviceId:       f.deviceId,
		CurrentVersion: constants.Version,
	}

	res, err := f.client.R().
		SetBody(request).
		SetHeader("X-Meta-Channel", constants.Channel).
		SetAuthToken(integration.SupabaseServiceKey).
		SetDoNotParseResponse(true).
		Post(f.windowsMetaVersionUrl())
	if err != nil {
		slog.Error("fetch version failed", "curl", res.Request.CurlCmd(), "err", err)
		return nil, err
	}
	return res.Body, err
}

type LatestVersionRequest struct {
	DeviceId       string `json:"deviceId"`
	CurrentVersion string `json:"currentVersion"`
}
