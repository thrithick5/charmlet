#!/usr/bin/env bash
# build-dmg.sh — Create a polished macOS disk image from the built .app bundle.
#
# Usage:
#   scripts/build-dmg.sh              (uses build/Charmlet.app)
#
# Output:
#   web/downloads/Charmlet.dmg
#
# The DMG contains:
#   • Charmlet.app      — the full application
#   • Applications →    — symlink for easy drag-and-drop install
#
# Dependencies: hdiutil (built into macOS), no paid tools required.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="Charmlet"
APP="$ROOT/build/${APP_NAME}.app"
DMG_OUT="$ROOT/web/downloads/${APP_NAME}.dmg"
VOL_NAME="$APP_NAME"
TMP_DMG="$ROOT/build/${APP_NAME}-tmp.dmg"
STAGING="$ROOT/build/dmg-staging"

if [ ! -d "$APP" ]; then
  echo "ERROR: $APP not found. Run macos/build.sh first." >&2
  exit 1
fi

mkdir -p "$(dirname "$DMG_OUT")"

echo "==> Preparing DMG staging area"
rm -rf "$STAGING"
mkdir -p "$STAGING"

# Copy the signed app bundle
cp -R "$APP" "$STAGING/"

# Create the Applications symlink for drag-and-drop install
ln -s /Applications "$STAGING/Applications"

echo "==> Creating temporary writable DMG"
rm -f "$TMP_DMG"
# Create a writable DMG with enough space
hdiutil create \
  -srcfolder "$STAGING" \
  -volname "$VOL_NAME" \
  -fs HFS+ \
  -fsargs "-c c=64,a=16,e=16" \
  -format UDRW \
  -size 20m \
  "$TMP_DMG"

echo "==> Customizing DMG window layout"
# Mount the writable DMG
MOUNT_DIR="/Volumes/$VOL_NAME"

# Unmount if already mounted
if [ -d "$MOUNT_DIR" ]; then
  hdiutil detach "$MOUNT_DIR" -quiet 2>/dev/null || true
fi

hdiutil attach "$TMP_DMG" -readwrite -noverify -noautoopen

# Use AppleScript to set Finder window properties
# This makes the DMG open with a nice layout showing the app and Applications folder
osascript <<APPLESCRIPT
  tell application "Finder"
    tell disk "$VOL_NAME"
      open
      set current view of container window to icon view
      set toolbar visible of container window to false
      set statusbar visible of container window to false
      set bounds of container window to {200, 120, 720, 440}
      set theViewOpts to icon view options of container window
      set arrangement of theViewOpts to not arranged
      set icon size of theViewOpts to 80
      -- Position app icon on the left, Applications on the right
      set position of item "${APP_NAME}.app" of container window to {120, 160}
      set position of item "Applications" of container window to {400, 160}
      close
      open
      update without registering applications
      delay 1
      close
    end tell
  end tell
APPLESCRIPT

# Set the volume icon if we have one
if [ -f "$ROOT/assets/Charmlet.icns" ]; then
  cp "$ROOT/assets/Charmlet.icns" "$MOUNT_DIR/.VolumeIcon.icns"
  SetFile -a C "$MOUNT_DIR" 2>/dev/null || true
fi

sync

hdiutil detach "$MOUNT_DIR" -quiet

echo "==> Compressing to final DMG"
rm -f "$DMG_OUT"
hdiutil convert "$TMP_DMG" \
  -format UDZO \
  -imagekey zlib-level=9 \
  -o "$DMG_OUT"

rm -f "$TMP_DMG"
rm -rf "$STAGING"

SIZE="$(du -sh "$DMG_OUT" | cut -f1)"
echo ""
echo "==> DMG ready: $DMG_OUT ($SIZE)"
echo "    Users can double-click to mount, then drag Charmlet into Applications."
