package updater

import (
	"io"
	"log/slog"

	"meta/backend/constants"

	"github.com/sanbornm/go-selfupdate/selfupdate"
	"resty.dev/v3"
)

const (
	versionUrl     = "https://joincyfzsuvolyklirho.supabase.co/functions/v1/version/latest"
	supabaseApiKey = ""

	// 使用腾讯云存储
	metaPublicUrl = "https://dl.deckz.fun/"
)

type UpdaterService struct {
	updater *selfupdate.Updater
}

func NewUpdaterService(deviceId string) *UpdaterService {
	updater := &selfupdate.Updater{
		CurrentVersion: constants.Version,
		ApiURL:         versionUrl,
		BinURL:         metaPublicUrl,
		DiffURL:        metaPublicUrl,
		Dir:            "selfupdate/",
		CmdName:        "meta",
		ForceCheck:     true,
		Requester:      newMetaFetcher(deviceId, versionUrl),
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

func newMetaFetcher(deviceId string, versionUrl string) *metaFetcher {
	client := resty.New().
		EnableGenerateCurlCmd().
		EnableTrace().
		SetDebugLogFormatter(resty.DebugLogJSONFormatter)
	return &metaFetcher{
		deviceId:       deviceId,
		client:         client,
		defaultFetcher: &selfupdate.HTTPRequester{},
	}
}

func (f *metaFetcher) Fetch(url string) (io.ReadCloser, error) {
	if f.versionUrl != url {
		return f.defaultFetcher.Fetch(url)
	}

	request := &LatestVersionRequest{
		DeviceId:       f.deviceId,
		CurrentVersion: constants.Version,
	}

	res, err := f.client.R().
		SetBody(request).
		SetHeader("X-Meta-Channel", constants.Channel).
		SetDoNotParseResponse(true).
		Post(versionUrl)
	if err != nil {
		return nil, err
	}
	return res.Body, err
}

type LatestVersionRequest struct {
	DeviceId       string
	CurrentVersion string
}
