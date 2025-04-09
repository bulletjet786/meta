VERSION=0.0.3

CRYSTAL_VERSION = 0.1.3

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
