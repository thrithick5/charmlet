#!/usr/bin/env bash
# serve.sh — start the static site on a local port. No build step, no dependencies.
set -euo pipefail

PORT="${1:-8080}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/web"

if [ ! -f "$ROOT/index.html" ]; then
  echo "cannot find web/index.html under $ROOT" >&2
  exit 1
fi

echo "Web Dangle → http://127.0.0.1:${PORT}/"
echo "charm surface → http://127.0.0.1:${PORT}/charm.html"
echo "(ctrl-c to stop)"

exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT"
