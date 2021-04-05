compile:
	@deno compile --unstable --lite --allow-write --allow-net main.ts

ci:
	@make fmt-check
	@make lint
#	@make test

fmt:
	@deno fmt *.ts **/*.ts

fmt-check:
	@deno fmt --check *.ts **/*.ts

lint:
	@deno lint --unstable *.ts **/*.ts

test:
	@deno test
