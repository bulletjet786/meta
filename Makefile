VERSION=0.0.1

CRYSTAL_VERSION = dev/0.1.2.alpha3

.PHONY:
build:
	cd crystall && pnpm run build:crystal

.PHONY:
update: build
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js crystal/dist/crystal/crystal.es.js --overwrite

.PHONY:
gen_pb:
	buf dep update
	buf generate

.PHONY:
clean_pb:
	rm -rf ./proto/gen/*

.PHONY:
