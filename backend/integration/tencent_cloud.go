package integration

import (
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
	tmt "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/tmt/v20180321"
)

var ProjectId int64 = 1334776

func NewTencentCloudClient() *tmt.Client {
	credential := common.NewCredential(
		"AKIDc6NRIwMiz60gAQRL2VwISH4i9NQHwOgk",
		"yjGZjt9HDvSoyxlMzVox6B5mHbhgS1NV",
	)

	client, _ := tmt.NewClient(credential, "", profile.NewClientProfile())
	return client
}