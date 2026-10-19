#!/usr/bin/env bash
# build-win-installer.sh — Compile and package Charmlet for Windows.
#
# Usage:
#   scripts/build-win-installer.sh
#
# Output:
#   web/downloads/Charmlet-Setup.exe  (1-click installer)
#   web/downloads/Charmlet-Windows.zip (portable standalone edition)
#
# Dependencies:
#   node, npm, makensis (brew install makensis)
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

echo "==> Preparing Windows app resources..."
mkdir -p "$WIN_DIR/assets"
cp "$ROOT/assets/Charmlet.ico" "$WIN_DIR/assets/Charmlet.ico"

rm -rf "$WIN_DIR/web"
mkdir -p "$WIN_DIR/web"
cp -R "$ROOT/web/." "$WIN_DIR/web/"
rm -rf "$WIN_DIR/web/downloads"
find "$WIN_DIR/web" -name '.DS_Store' -delete 2>/dev/null || true

echo "==> Packaging native Windows desktop overlay with Electron..."
(
  cd "$WIN_DIR"
  rm -rf dist
  npx @electron/packager . Charmlet \
    --platform=win32 \
    --arch=x64 \
    --icon=assets/Charmlet.ico \
    --out=dist \
    --overwrite \
    --prune=true \
    --ignore="^/dist($|/)"
)

if [ ! -f "$WIN_DIR/dist/Charmlet-win32-x64/Charmlet.exe" ]; then
  echo "ERROR: Electron packaging failed. Charmlet.exe not found in dist." >&2
  exit 1
fi

echo "==> Compiling Charmlet-Setup.exe (1-click installer with LZMA compression)..."
(cd "$WIN_DIR" && makensis installer.nsi)

SETUP_EXE="$OUT_DIR/Charmlet-Setup.exe"
if [ ! -f "$SETUP_EXE" ]; then
  echo "ERROR: Charmlet-Setup.exe build failed." >&2
  exit 1
fi

echo "==> Creating Charmlet-Windows.zip (portable edition)..."
(
  cd "$WIN_DIR/dist"
  rm -f "$OUT_DIR/Charmlet-Windows.zip"
  zip -r -q "$OUT_DIR/Charmlet-Windows.zip" Charmlet-win32-x64
)

SETUP_SIZE="$(du -sh "$SETUP_EXE" | cut -f1)"
ZIP_SIZE="$(du -sh "$OUT_DIR/Charmlet-Windows.zip" | cut -f1)"

echo ""
echo "==> Windows build complete!"
echo "    Installer: $SETUP_EXE ($SETUP_SIZE)"
echo "    Portable:  $OUT_DIR/Charmlet-Windows.zip ($ZIP_SIZE)"
echo "    Users can run Charmlet-Setup.exe for 1-click install, or unzip Charmlet-Windows.zip and run Charmlet.exe directly."
