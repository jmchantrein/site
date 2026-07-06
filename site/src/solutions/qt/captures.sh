#!/bin/bash
# Regenerate the course's screenshots FROM the displayed code (single
# source): build everything, then run each GUI example offscreen with
# --capture. The images land in site/public/images/qt/.
# Requires: cmake, g++, qt6-base-dev.
set -euo pipefail
cd "$(dirname "$0")"

build="${TMPDIR:-/tmp}/qt-captures-build"
dest="$(cd ../../../public && pwd)/images/qt"
mkdir -p "$dest"

cmake -S . -B "$build" -DCMAKE_BUILD_TYPE=Release >/dev/null
cmake --build "$build" -j"$(nproc)" >/dev/null

export QT_QPA_PLATFORM=offscreen
for gui in hello layouts compteur evenements dessin; do
  "$build/$gui" --capture "$dest/$gui.png" 2>/dev/null
  echo "✔ $dest/$gui.png"
done
