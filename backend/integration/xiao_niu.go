package integration

import (
	resty "resty.dev/v3"
)


const XiaoNiuApiKey = "c0e5379394438203aabc9bd8dea9212e"

func NewXiaoNiuClient() *resty.Client {
	return resty.New().
		EnableGenerateCurlCmd().
		EnableTrace().
		SetDebugLogFormatter(resty.DebugLogJSONFormatter).
		SetBaseURL("https://api.niutrans.com")
}