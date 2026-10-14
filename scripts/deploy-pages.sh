#!/usr/bin/env bash
# Build CatMut and publish it to the GitHub Pages repo under catmut/.
#
# Usage: scripts/deploy-pages.sh [--no-push]
#
# Env:
#   PAGES_DIR     local clone of the Pages repo (default: ../kitirat-work.github.io)
#   PAGES_REPO    clone URL used when PAGES_DIR does not exist
#   PAGES_BRANCH  branch to publish to (default: main)
#   PAGES_SUBDIR  folder inside the Pages repo (default: catmut)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="${PAGES_DIR:-$ROOT/../kitirat-work.github.io}"
PAGES_REPO="${PAGES_REPO:-https://github.com/kitirat-work/kitirat-work.github.io}"
PAGES_BRANCH="${PAGES_BRANCH:-main}"
PAGES_SUBDIR="${PAGES_SUBDIR:-catmut}"
PUSH=1
[[ "${1:-}" == "--no-push" ]] && PUSH=0

cd "$ROOT"
SRC_REV="$(git rev-parse --short HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "warning: CatMut working tree has uncommitted changes; they will be included in the build" >&2
  SRC_REV="$SRC_REV-dirty"
fi

echo "==> Building CatMut ($SRC_REV)"
[[ -d node_modules ]] || npm ci
npx tsc
# Relative base so assets resolve under /<PAGES_SUBDIR>/.
npx vite build --base ./

echo "==> Updating Pages repo at $PAGES_DIR"
if [[ ! -d "$PAGES_DIR/.git" ]]; then
  git clone --depth 1 --branch "$PAGES_BRANCH" "$PAGES_REPO" "$PAGES_DIR"
fi
git -C "$PAGES_DIR" fetch origin "$PAGES_BRANCH"
git -C "$PAGES_DIR" checkout "$PAGES_BRANCH"
git -C "$PAGES_DIR" merge --ff-only "origin/$PAGES_BRANCH"

DEST="$PAGES_DIR/$PAGES_SUBDIR"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R dist/. "$DEST/"

git -C "$PAGES_DIR" add -A "$PAGES_SUBDIR"
if git -C "$PAGES_DIR" diff --cached --quiet; then
  echo "==> No changes to publish"
  exit 0
fi
git -C "$PAGES_DIR" commit -m "Update CatMut build from kitirat-work/CatMut@$SRC_REV"

if [[ $PUSH -eq 1 ]]; then
  echo "==> Pushing to $PAGES_BRANCH"
  git -C "$PAGES_DIR" push origin "$PAGES_BRANCH"
else
  echo "==> Committed locally (--no-push); push with: git -C \"$PAGES_DIR\" push origin $PAGES_BRANCH"
fi
