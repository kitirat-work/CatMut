.PHONY: install dev build preview typecheck tokens clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

typecheck:
	npm run typecheck

tokens:
	npm run tokens

clean:
	rm -rf dist
