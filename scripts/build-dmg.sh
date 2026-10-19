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

# Copy the signed app bundle and ensure clean code signature in staging
cp -R "$APP" "$STAGING/"
xattr -cr "$STAGING/${APP_NAME}.app"
codesign --force --deep --sign - --timestamp=none "$STAGING/${APP_NAME}.app"
codesign --verify --deep --strict "$STAGING/${APP_NAME}.app"

# Create the Applications symlink for drag-and-drop install
ln -s /Applications "$STAGING/Applications"

# Add a 1-click helper script to bypass Gatekeeper / "Run Anyway"
cat > "$STAGING/Open Charmlet.command" << 'CMDEOF'
#!/usr/bin/env bash
echo "🍀 Launching Charmlet..."
if [ -d "/Applications/Charmlet.app" ]; then
  xattr -dr com.apple.quarantine "/Applications/Charmlet.app" 2>/dev/null || true
  xattr -cr "/Applications/Charmlet.app" 2>/dev/null || true
  open "/Applications/Charmlet.app"
  echo "✨ Charmlet is now running in your macOS menu bar!"
else
  DIR="$(cd "$(dirname "$0")" && pwd)"
  if [ -d "$DIR/Charmlet.app" ]; then
    xattr -cr "$DIR/Charmlet.app" 2>/dev/null || true
    open "$DIR/Charmlet.app"
    echo "✨ Charmlet is now running in your macOS menu bar!"
  fi
fi
CMDEOF
chmod +x "$STAGING/Open Charmlet.command"

echo "==> Creating temporary writable DMG"
rm -f "$TMP_DMG"
# Create a writable DMG with enough space
hdiutil create \
  -srcfolder "$STAGING" \
  -volname "$VOL_NAME" \
  -fs HFS+ \
  -fsargs "-c c=64,a=16,e=16" \
  -format UDRW \
  -size 25m \
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
# This makes the DMG open with a nice layout showing the app, Applications folder, and helper
osascript <<APPLESCRIPT || true
  tell application "Finder"
    tell disk "$VOL_NAME"
      open
      set current view of container window to icon view
      set toolbar visible of container window to false
      set statusbar visible of container window to false
      set bounds of container window to {160, 100, 780, 440}
      set theViewOpts to icon view options of container window
      set arrangement of theViewOpts to not arranged
      set icon size of theViewOpts to 76
      -- Position app icon on left, Applications in middle, and Open helper on right
      set position of item "${APP_NAME}.app" of container window to {110, 160}
      set position of item "Applications" of container window to {310, 160}
      set position of item "Open Charmlet.command" of container window to {510, 160}
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
