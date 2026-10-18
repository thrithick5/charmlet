#!/usr/bin/env bash
# package-release.sh — Build both macOS (.dmg) and Windows (.exe) native packages.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/web/downloads"

echo "========================================================"
echo "  Packaging Charmlet Native Distributions"
echo "========================================================"
echo ""

# 1. Assets
if [ ! -f "$ROOT/assets/Charmlet.icns" ] || [ ! -f "$ROOT/assets/Charmlet.ico" ]; then
  echo "==> [1/3] Generating icons..."
  bash "$ROOT/scripts/generate-icons.sh"
else
  echo "==> [1/3] Icons ready (assets/Charmlet.icns, assets/Charmlet.ico)"
fi

# 2. macOS DMG
echo ""
echo "==> [2/3] Building macOS Disk Image (.dmg)..."
if [ -d "$ROOT/build/Charmlet.app" ]; then
  bash "$ROOT/scripts/build-dmg.sh"
else
  echo "    Warning: build/Charmlet.app not found. Run macos/build.sh first."
fi

# 3. Windows Setup Installer
echo ""
echo "==> [3/3] Building Windows Setup Installer (.exe)..."
bash "$ROOT/scripts/build-win-installer.sh"

echo ""
echo "========================================================"
echo "  All release packages ready in web/downloads/:"
echo "========================================================"
ls -lh "$ROOT/web/downloads"/*.{dmg,exe} 2>/dev/null || ls -lh "$ROOT/web/downloads"
