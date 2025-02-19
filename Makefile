.PHONY:
gen_pb:
	buf dep update
	buf generate

.PHONY:
clean_pb:
	rm -rf ./proto/gen/*