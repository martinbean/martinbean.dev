all: install build

install:
	bundle install

build:
	jekyll build

serve:
	jekyll serve -w
