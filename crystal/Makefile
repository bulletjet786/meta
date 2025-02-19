CRYSTAL_VERSION = 0.1.0.alpha2

.PHONY:
upload_wc:
	pnpm run build:wc
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js build/crystal.es.js --overwrite

.PHONY:
build:
	pnpm.cmd run build:crystal
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js build/crystal.es.js --overwrite