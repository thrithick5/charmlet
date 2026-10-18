#!/usr/bin/env bash
# generate-icons.sh — Convert assets/icon.svg into:
#   assets/Charmlet.icns  (macOS app icon)
#   assets/Charmlet.ico   (Windows executable / installer icon)
#
# Dependencies (all free):
#   rsvg-convert  — brew install librsvg  (already installed)
#   iconutil      — built into macOS
#   python3+PIL   — pip install Pillow    (already installed)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS="$ROOT/assets"
SVG="$ASSETS/icon.svg"
ICONSET="$ASSETS/Charmlet.iconset"

if [ ! -f "$SVG" ]; then
  echo "ERROR: $SVG not found" >&2
  exit 1
fi

echo "==> Generating macOS .icns"
rm -rf "$ICONSET"
mkdir -p "$ICONSET"

# macOS iconset naming convention:
#   icon_WxH.png    — standard resolution
#   icon_WxH@2x.png — Retina (pixel count is 2*W × 2*H)
# We render each required file individually.
render() {
  local name="$1" px="$2"
  rsvg-convert -w "$px" -h "$px" "$SVG" -o "$ICONSET/$name"
}

render "icon_16x16.png"      16
render "icon_16x16@2x.png"   32
render "icon_32x32.png"      32
render "icon_32x32@2x.png"   64
render "icon_128x128.png"    128
render "icon_128x128@2x.png" 256
render "icon_256x256.png"    256
render "icon_256x256@2x.png" 512
render "icon_512x512.png"    512
render "icon_512x512@2x.png" 1024

iconutil -c icns "$ICONSET" -o "$ASSETS/Charmlet.icns"
echo "    Created $ASSETS/Charmlet.icns"

echo "==> Generating Windows .ico"
# Windows .ico with multiple resolutions: 16, 32, 48, 256
python3 - "$SVG" "$ASSETS/Charmlet.ico" <<'PYEOF'
import sys, subprocess, tempfile, os, struct, io
from PIL import Image

svg_path = sys.argv[1]
ico_path = sys.argv[2]

sizes = [16, 32, 48, 256]
png_data_list = []

with tempfile.TemporaryDirectory() as tmp:
    for s in sizes:
        png = os.path.join(tmp, f"icon_{s}.png")
        subprocess.run([
            "rsvg-convert", "-w", str(s), "-h", str(s), svg_path, "-o", png
        ], check=True)
        img = Image.open(png).convert("RGBA").resize((s, s), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_data_list.append((s, buf.getvalue()))

# Manually construct ICO file for reliable multi-resolution embedding
num_images = len(png_data_list)
# ICO header: reserved(2) + type(2) + count(2) = 6 bytes
# Each directory entry: 16 bytes
header_size = 6 + num_images * 16
offset = header_size

ico = io.BytesIO()
# ICONDIR header
ico.write(struct.pack('<HHH', 0, 1, num_images))

# Write directory entries
for (size, data) in png_data_list:
    w = 0 if size == 256 else size  # 0 means 256 in ICO spec
    h = 0 if size == 256 else size
    ico.write(struct.pack('<BBBBHHII',
        w, h,      # width, height
        0,         # color palette count
        0,         # reserved
        1,         # color planes
        32,        # bits per pixel
        len(data), # size of image data
        offset     # offset to image data
    ))
    offset += len(data)

# Write image data
for (size, data) in png_data_list:
    ico.write(data)

with open(ico_path, 'wb') as f:
    f.write(ico.getvalue())

# Verify
with open(ico_path, 'rb') as f:
    f.read(4)
    count = struct.unpack('<H', f.read(2))[0]
    embedded = []
    for i in range(count):
        entry = f.read(16)
        w = 256 if entry[0] == 0 else entry[0]
        embedded.append(f"{w}x{w}")
    print(f"    Created {ico_path}")
    print(f"    ICO sizes: {', '.join(embedded)}")
PYEOF

# Clean up the iconset folder (the .icns is what we need)
rm -rf "$ICONSET"

echo "==> Done! Icons ready:"
ls -lh "$ASSETS/Charmlet.icns" "$ASSETS/Charmlet.ico"
