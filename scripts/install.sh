#!/usr/bin/env bash
# install.sh — 1-Click Zero-Friction Installer for Charmlet (macOS)
# Bypasses macOS Gatekeeper / "Run Anyway" prompts by installing cleanly without quarantine attributes.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/thrithick5/charmlet/main/scripts/install.sh | bash
set -euo pipefail

echo "🍀 Installing Charmlet for macOS..."

REPO="thrithick5/charmlet"
DMG_URL="https://raw.githubusercontent.com/${REPO}/main/web/downloads/Charmlet.dmg"
TMP_DIR="$(mktemp -d /tmp/charmlet-install.XXXXXX)"
TMP_DMG="${TMP_DIR}/Charmlet.dmg"
MOUNT_DIR="${TMP_DIR}/mount"

cleanup() {
  if [ -d "${MOUNT_DIR}" ]; then
    hdiutil detach "${MOUNT_DIR}" -quiet 2>/dev/null || true
  fi
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

echo "==> Downloading latest Charmlet disk image..."
if command -v curl >/dev/null 2>&1; then
  curl -fL --progress-bar "${DMG_URL}" -o "${TMP_DMG}"
elif command -v wget >/dev/null 2>&1; then
  wget -q --show-progress "${DMG_URL}" -O "${TMP_DMG}"
else
  echo "Error: curl or wget is required." >&2
  exit 1
fi

echo "==> Mounting disk image..."
mkdir -p "${MOUNT_DIR}"
hdiutil attach "${TMP_DMG}" -mountpoint "${MOUNT_DIR}" -nobrowse -readonly -quiet

echo "==> Installing Charmlet to /Applications..."
rm -rf "/Applications/Charmlet.app"
cp -R "${MOUNT_DIR}/Charmlet.app" "/Applications/"

echo "==> Removing quarantine & Gatekeeper locks..."
# This removes the com.apple.quarantine attribute so macOS opens the app directly without "Run Anyway"
xattr -dr com.apple.quarantine "/Applications/Charmlet.app" 2>/dev/null || true
xattr -cr "/Applications/Charmlet.app" 2>/dev/null || true

# Register URL schemes (charmlet:// and luckydangle://)
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "/Applications/Charmlet.app" 2>/dev/null || true

echo "==> Launching Charmlet..."
open "/Applications/Charmlet.app"

echo ""
echo "✨ Charmlet successfully installed and launched!"
echo "   Look for the elegant four-leaf clover charm in your macOS menu bar."
echo "   Shortcuts: Ctrl+D (toggle) · Ctrl+S (ritual) · Ctrl+F (flick)"
