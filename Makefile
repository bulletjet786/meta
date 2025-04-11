VERSION=0.0.3

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