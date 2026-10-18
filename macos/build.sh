#!/usr/bin/env bash
# build.sh — compile LuckyDangle and assemble a real, launchable .app bundle.
#
#   macos/build.sh            build into ./build/LuckyDangle.app
#   macos/build.sh --run      build, then launch it
#
# SwiftPM alone cannot produce a menu-bar app: an executable needs an Info.plist
# with LSUIElement (no Dock icon) and CFBundleURLTypes (the luckydangle:// scheme),
# and it needs the web engine sitting in Resources. So we compile with SwiftPM and
# assemble the bundle by hand.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG="$ROOT/macos"
OUT="$ROOT/build"
APP="$OUT/Charmlet.app"

RUN=0
[ "${1:-}" = "--run" ] && RUN=1

# SwiftPM defaults to caches under ~/Library and to sandboxing the manifest build.
# On a machine where the toolchain is not allowed to write there — or where we are
# already inside a sandbox — both of those fail hard. Redirect every cache into the
# project and turn SwiftPM's own sandbox off.
export CLANG_MODULE_CACHE_PATH="$ROOT/.build-cache/clang"
export SWIFTPM_MODULECACHE_OVERRIDE="$ROOT/.build-cache/swiftpm"
mkdir -p "$CLANG_MODULE_CACHE_PATH" "$SWIFTPM_MODULECACHE_OVERRIDE" \
         "$ROOT/.build-config" "$ROOT/.build-security"

SWIFT_ARGS=(
  -c release
  --package-path "$PKG"
  --disable-sandbox
  --scratch-path "$ROOT/.build"
  --cache-path "$ROOT/.build-cache"
  --config-path "$ROOT/.build-config"
  --security-path "$ROOT/.build-security"
)

echo "==> compiling (release)"
swift build "${SWIFT_ARGS[@]}"

BIN_DIR="$(swift build "${SWIFT_ARGS[@]}" --show-bin-path)"
BIN="$BIN_DIR/Charmlet"
if [ ! -x "$BIN" ]; then
  echo "build reported success but there is no binary at $BIN" >&2
  exit 1
fi

echo "==> bundling web scripts"
npx -y esbuild --bundle "$ROOT/web/js/app.js" --outfile="$ROOT/web/js/bundle.js" --format=iife --minify=false

echo "==> assembling $(basename "$APP")"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/web"
cp "$BIN" "$APP/Contents/MacOS/Charmlet"

# The web engine is the app's whole visual layer. Copy it in, minus the site-only bits.
cp -R "$ROOT/web/." "$APP/Contents/Resources/web/"
rm -f "$APP/Contents/Resources/web/.DS_Store"
find "$APP/Contents/Resources/web" -name '.DS_Store' -delete 2>/dev/null || true

# Copy the app icon into the bundle
if [ -f "$ROOT/assets/Charmlet.icns" ]; then
  cp "$ROOT/assets/Charmlet.icns" "$APP/Contents/Resources/Charmlet.icns"
  echo "    bundled app icon"
fi

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Charmlet</string>
    <key>CFBundleDisplayName</key>
    <string>Charmlet</string>
    <key>CFBundleIdentifier</key>
    <string>personal.charmlet.local</string>
    <key>CFBundleExecutable</key>
    <string>Charmlet</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>CFBundleIconFile</key>
    <string>Charmlet</string>

    <!-- Menu bar only: no Dock icon, no main window. -->
    <key>LSUIElement</key>
    <true/>
    <key>NSHighResolutionCapable</key>
    <true/>

    <!-- charmlet:// and legacy luckydangle:// routes -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>personal.charmlet.url</string>
            <key>CFBundleTypeRole</key>
            <string>Viewer</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>charmlet</string>
                <string>luckydangle</string>
            </array>
        </dict>
    </array>

    <key>NSHumanReadableCopyright</key>
    <string>Charmlet — a free, personal, local build. All charms are original artwork.</string>
</dict>
</plist>
PLIST

plutil -lint "$APP/Contents/Info.plist" >/dev/null

echo "==> ad-hoc signing"
if codesign --force --sign - --timestamp=none "$APP" 2>/dev/null; then
  echo "    signed (ad-hoc)"
else
  echo "    skipped — the app still runs locally, it just has no signature"
fi

# Let LaunchServices notice the new bundle so luckydangle:// resolves without a logout.
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
  -f "$APP" >/dev/null 2>&1 || true

SIZE="$(du -sh "$APP" | cut -f1)"
echo ""
echo "built  $APP  ($SIZE)"

if [ -f "$ROOT/scripts/package-release.sh" ]; then
  "$ROOT/scripts/package-release.sh"
fi

echo ""
echo "run it:      open \"$APP\""
echo "try a bless: open 'charmlet://bless'"
echo "shortcuts:   ctrl-D show/hide   ctrl-S ritual   ctrl-F flick"

if [ "$RUN" = "1" ]; then
  echo ""
  echo "==> launching"
  open "$APP"
fi
