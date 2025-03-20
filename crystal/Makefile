CRYSTAL_VERSION = 0.1.1.alpha1

.PHONY:
upload_wc:
	pnpm run build:wc
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js dist/crystal/crystal.es.js --overwrite

.PHONY:
build:
	pnpm run build:crystal

update:
	pnpm run build:crystal
	qshell fput hulu-package crystal/$(CRYSTAL_VERSION)/crystal.es.js dist/crystal/crystal.es.js --overwrite