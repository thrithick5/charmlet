#!/usr/bin/env bash
# build-win-installer.sh — Compile the Windows silent launcher and 1-click Setup installer.
#
# Usage:
#   scripts/build-win-installer.sh
#
# Output:
#   web/downloads/Charmlet-Setup.exe
#
# Dependencies:
#   makensis (free via Homebrew: brew install makensis)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WIN_DIR="$ROOT/windows"
OUT_DIR="$ROOT/web/downloads"

mkdir -p "$OUT_DIR"

if ! command -v makensis >/dev/null 2>&1; then
  echo "ERROR: makensis is not installed. Install via: brew install makensis" >&2
  exit 1
fi

if [ ! -f "$ROOT/assets/Charmlet.ico" ]; then
  echo "==> Missing icon, generating assets..."
  bash "$ROOT/scripts/generate-icons.sh"
fi

echo "==> Bundling web engine..."
npx -y esbuild --bundle "$ROOT/web/js/app.js" --outfile="$ROOT/web/js/bundle.js" --format=iife --minify=false

echo "==> Compiling Charmlet.exe (silent launcher)..."
(cd "$WIN_DIR" && makensis launcher.nsi)

if [ ! -f "$WIN_DIR/Charmlet.exe" ]; then
  echo "ERROR: Charmlet.exe build failed." >&2
  exit 1
fi

echo "==> Compiling Charmlet-Setup.exe (1-click installer)..."
(cd "$WIN_DIR" && makensis installer.nsi)

SETUP_EXE="$OUT_DIR/Charmlet-Setup.exe"
if [ ! -f "$SETUP_EXE" ]; then
  echo "ERROR: Charmlet-Setup.exe build failed." >&2
  exit 1
fi

SIZE="$(du -sh "$SETUP_EXE" | cut -f1)"
echo ""
echo "==> Windows Installer ready: $SETUP_EXE ($SIZE)"
echo "    Users can double-click to install and automatically launch Charmlet."
