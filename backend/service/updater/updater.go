package updater

import (
	"io"
	"log/slog"

	"github.com/sanbornm/go-selfupdate/selfupdate"
	"resty.dev/v3"

	"meta/backend/constants"
	"meta/backend/infra"
)

const (
	versionUrl = "/functions/v1/version/latest"
	cmdName    = "meta"
	// 使用腾讯云存储
	metaPublicUrl = "https://dl.g.deckz.fun/"
	//metaPublicUrl = "https://download-1252010398.cos.ap-shanghai.myqcloud.com/"
)

type UpdaterService struct {
	updater *selfupdate.Updater
}

func NewUpdaterService(deviceId string, channel string) *UpdaterService {
	updater := &selfupdate.Updater{
		CurrentVersion: constants.Version,
		ApiURL:         infra.SupabaseApiUrl + versionUrl + "/",
		BinURL:         metaPublicUrl,
		DiffURL:        metaPublicUrl,
		Dir:            "selfupdate/",
		CmdName:        cmdName,
		ForceCheck:     true,
		Requester:      newMetaFetcher(deviceId, channel),
		OnSuccessfulUpdate: func() {
			slog.Info("Update successful", "from", constants.Version)
		},
	}

	return &UpdaterService{
		updater: updater,
	}
}

func (s *UpdaterService) Start() {
	//go func() {
	//	t := time.NewTimer(10 * time.Minute)
	//	<-t.C
	//
	//	if err := s.updater.BackgroundRun(); err != nil {
	//		slog.Error("Start update background failed", "err", err)
	//		return
	//	}
	//	slog.Info("Update binary completed")
	//}()
}

type metaFetcher struct {
	deviceId   string
	versionUrl string
	channel    string

	client         *resty.Client
	defaultFetcher *selfupdate.HTTPRequester
}

func newMetaFetcher(deviceId string, channel string) *metaFetcher {
	client := resty.New().
		EnableGenerateCurlCmd().
		EnableTrace().
		SetDebugLogFormatter(resty.DebugLogJSONFormatter).
		SetDebugLogCurlCmd(true).
		SetDebug(true)
	return &metaFetcher{
		deviceId:       deviceId,
		channel:        channel,
		client:         client,
		defaultFetcher: &selfupdate.HTTPRequester{},
		versionUrl:     versionUrl,
	}
}

func (f *metaFetcher) windowsMetaVersionUrl() string {
	return infra.SupabaseApiUrl + f.versionUrl + "/" + cmdName + "/windows-amd64.json"
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
		SetHeader("X-Meta-Channel", f.channel).
		SetAuthToken(infra.SupabaseAnonKey).
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
