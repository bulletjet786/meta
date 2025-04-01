CRYSTAL_VERSION = dev/0.1.2.alpha3

.PHONY:
build:
	pnpm run build:crystal

.PHONY:
update: build
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js dist/crystal/crystal.es.js --overwrite