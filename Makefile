VERSION=0.0.1

.PHONY:
gen_pb:
	buf dep update
	buf generate

.PHONY:
clean_pb:
	rm -rf ./proto/gen/*

.PHONY:
dist:
	

.PHONY:
