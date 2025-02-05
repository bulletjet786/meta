CRYSTAL_VERSION = 0.0.3.alpha1

.PHONY:
upload_wc:
	pnpm run build:wc
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js build/crystal.es.js --overwrite
