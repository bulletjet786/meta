# Options

# Built-in
GOHOSTOS:=$(shell go env GOHOSTOS)
GOPATH:=$(shell go env GOPATH)
DATETIME=$(shell echo %date:~0,4%%date:5,2%%date:8,2%%time:~3,2%%time:~6,2%)
VERSION=0.0.7
COS_BIN_URL=https://cosbrowser.cloud.tencent.com/software/coscli/coscli-linux-amd64
ifeq ($(GOHOSTOS), windows)
	COS_BIN_URL=https://cosbrowser.cloud.tencent.com/software/coscli/coscli-windows-amd64.exe
endif

.PHONY: build_crystal
build_crystal:
	cd crystal && pnpm run build:crystal

.PHONY: build_browser
build_browser:
	cd browser && pnpm run build

.PHONY: start
start: build_crystal # build_browser
	wails dev -s -ldflags "-X meta/backend/constants.Version=$(VERSION)"

.PHONY: build
build: build_browser build_crystal
	rmdir /s /q build\bin || cmd /c "exit /b 0"
	mkdir build\bin
	wails build -nsis -ldflags "-X meta/backend/constants.Version=$(VERSION)"

.PHONY: push
push: build
	go-selfupdate -o ./build/bin/selfupdate/ ./build/bin/SteamMeta.exe $(VERSION)
	copy /y build\bin\selfupdate\windows-amd64.json tame\supabase\functions\version\versions\$(VERSION).json
	coscli.exe -c tame/tool_configs/cos.yaml cp ./build/bin/meta-amd64-installer.exe cos://download-1252010398/meta/$(VERSION)/meta-amd64-installer.exe
	coscli.exe -c tame/tool_configs/cos.yaml cp ./build/bin/selfupdate/$(VERSION)/windows-amd64.gz cos://download-1252010398/meta/$(VERSION)/windows-amd64.gz
	coscli.exe -c tame/tool_configs/cos.yaml cp ./build/bin/selfupdate/windows-amd64.json cos://download-1252010398/meta/$(VERSION)/windows-amd64.json

.PHONY: install_tool
install_tool:
	wget -O $(GOPATH)/bin/coscli $(COS_BIN_URL)
	chmod +x $(GOPATH)/bin/coscli
