DOCKER=docker

.PHONY: all build serve

all: build serve

build:
	$(DOCKER) build --no-cache --tag martinbean:latest .

serve:
	$(DOCKER) run --publish 4000:4000 --volume $(shell pwd):/usr/local/src --workdir /usr/local/src martinbean:latest
