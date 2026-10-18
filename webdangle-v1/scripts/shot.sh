#!/usr/bin/env bash
# shot.sh — headless screenshot of the running site, for visual verification.
#
#   scripts/shot.sh <url> <out.png> [width] [height] [wait-ms] [timeout-s]
#
# Notes for anyone running this on a locked-down machine:
#   * HOME and TMPDIR are redirected into a scratch dir. Chromium's crashpad
#     writer needs to create files under ~/Library and fails hard (or hangs)
#     when the sandbox denies it.
#   * `--headless=old --use-gl=swiftshader --disable-gpu-sandbox` is the
#     combination that actually renders here. The newer headless mode waits on
#     CVDisplayLinkCreateWithCGDisplay, which never returns without a display.
#   * The whole run is wrapped in a watchdog so a hung browser fails the script
#     instead of blocking forever.
#   * Do NOT add --virtual-time-budget. The page runs a permanent
#     requestAnimationFrame physics loop, and virtual time never resolves against
#     it, so the capture deadlocks.
set -euo pipefail

URL="${1:?usage: shot.sh <url> <out.png> [w] [h] [wait-ms] [timeout-s]}"
OUT="${2:?missing output path}"
W="${3:-1440}"
H="${4:-1000}"
WAIT="${5:-6000}"   # kept for interface compatibility; see note below
LIMIT="${6:-45}"

CANDIDATES=(
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "/Applications/Chromium.app/Contents/MacOS/Chromium"
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
)

BIN=""
for c in "${CANDIDATES[@]}"; do
  if [ -x "$c" ]; then BIN="$c"; break; fi
done

if [ -z "$BIN" ]; then
  echo "no chromium-family browser found; install Brave or Chrome" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"
# Scratch must live inside the project. Chromium needs to create a profile tree,
# and on a sandboxed machine both ~/Library and the system temp dir can be denied.
SCRATCH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.shot-scratch-$$"
mkdir -p "$SCRATCH"
trap 'rm -rf "$SCRATCH" 2>/dev/null || true' EXIT

HOME="$SCRATCH" TMPDIR="$SCRATCH" "$BIN" \
  --headless=old \
  --use-gl=swiftshader \
  --disable-gpu-sandbox \
  --disable-crash-reporter \
  --disable-breakpad \
  --no-sandbox \
  --no-first-run \
  --no-default-browser-check \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --user-data-dir="$SCRATCH/prof" \
  --window-size="${W},${H}" \
  --screenshot="$OUT" \
  "$URL" >"$SCRATCH/out.log" 2>&1 &
PID=$!

n=0
while kill -0 "$PID" 2>/dev/null && [ "$n" -lt "$LIMIT" ]; do
  sleep 1
  n=$((n + 1))
done

if kill -0 "$PID" 2>/dev/null; then
  kill -9 "$PID" 2>/dev/null || true
  if [ ! -s "$OUT" ]; then
    echo "screenshot timed out after ${LIMIT}s" >&2
    exit 1
  fi
fi
wait "$PID" 2>/dev/null || true

if [ ! -s "$OUT" ]; then
  echo "screenshot failed: $OUT is empty" >&2
  tail -5 "$SCRATCH/out.log" >&2 || true
  exit 1
fi

echo "$OUT  ($(wc -c <"$OUT" | tr -d ' ') bytes, ${W}x${H})"
