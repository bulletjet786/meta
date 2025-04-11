# Options
Channel ?= "Develop"

# Built-in
DATETIME = $(shell echo %date:~0,4%%date:5,2%%date:8,2%%time:~3,2%%time:~6,2%)
REALEASE_VERSION=0.0.3
DEVELOP_VERSION=0.0.4

ifeq ($(Channel), "Develop")
	VERSION = $(DEVELOP_VERSION)
else
	VERSION = $(REALEASE_VERSION)
endif

CRYSTAL_VERSION = 0.1.3

FC = version

.PHONY: build_crystal
build_crystal:
	cd crystal && pnpm run build:crystal

.PHONY: update_crystal
update_crystal: build_crystal
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js crystal/dist/crystal/crystal.es.js --overwrite

.PHONY:
gen_pb: gen_pb
	buf dep update
	buf generate

.PHONY:
sp_serve: sp_serve
	pnpx supabase functions serve

.PHONY:
sp_deploy: sp_deploy
	pnpx supabase functions deploy $(FC)

.PHONY
start: start
	wails dev -s -ldflags "-X backend.Version=$(VERSION) -X backend.Channel=$(Channel)"

.PHONY:
build: build
	wails build -nsis -ldflags "-X backend.Version=$(VERSION) -X backend.Channel=$(Channel)"
