# Options
Channel ?= Develop

# Built-in
GOHOSTOS:=$(shell go env GOHOSTOS)
GOPATH:=$(shell go env GOPATH)
DATETIME=$(shell echo %date:~0,4%%date:5,2%%date:8,2%%time:~3,2%%time:~6,2%)
RELEASE_VERSION=0.0.3
DEVELOP_VERSION=0.0.4
COS_BIN_URL=https://cosbrowser.cloud.tencent.com/software/coscli/coscli-linux-amd64
ifeq ($(GOHOSTOS), windows)
	COS_BIN_URL=https://cosbrowser.cloud.tencent.com/software/coscli/coscli-windows-amd64.exe
endif

ifeq ($(Channel), "Develop")
	VERSION = $(DEVELOP_VERSION)
else
	VERSION = $(RELEASE_VERSION)
endif

CRYSTAL_VERSION = 0.1.4.alpha1

FC = version

.PHONY: build_crystal
build_crystal:
	cd crystal && pnpm run build:crystal

.PHONY: update_crystal
update_crystal: build_crystal
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js crystal/dist/crystal/crystal.es.js --overwrite

.PHONY: gen_pb
gen_pb:
	buf dep update
	buf generate

.PHONY: sp_serve
sp_serve:
	pnpx supabase functions serve

.PHONY: sp_deploy
sp_deploy:
	pnpx supabase functions deploy $(FC)

.PHONY: start
start:
	wails dev -s -ldflags "-X backend.constants.Version=$(VERSION) -X backend.constants.Channel=$(Channel)"

.PHONY: build
build:
	wails build -nsis -ldflags "-X backend.constants.Version=$(VERSION) -X backend.constants.Channel=$(Channel)"

.PHONY: release
release: build
	go-selfupdate -o ./build/bin/selfupdate/ ./build/bin/SteamMeta.exe $(VERSION)
	coscli.exe -c tool_configs/cos.yaml cp ./build/bin/meta-amd64-installer.exe cos://download-1252010398/meta/$(VERSION)/meta-amd64-installer.exe
	coscli.exe -c tool_configs/cos.yaml cp ./build/bin/selfupdate/$(VERSION)/windows-amd64.gz cos://download-1252010398/meta/$(VERSION)/windows-amd64.gz
	coscli.exe -c tool_configs/cos.yaml cp ./build/bin/selfupdate/windows-amd64.json cos://download-1252010398/meta/$(VERSION)/windows-amd64.json

.PHONY: install_tool
install_tool:
	wget -O $(GOPATH)/bin/coscli $(COS_BIN_URL)
	chmod +x $(GOPATH)/bin/coscli
