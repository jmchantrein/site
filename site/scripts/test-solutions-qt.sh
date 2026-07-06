#!/usr/bin/env bash
# Harnais frère de test-solutions.sh pour la série Qt 6.
#
# SOURCE UNIQUE : ce script compile et exécute les fichiers de
#   site/src/solutions/qt/   (exemples C++ Qt 6 + CMakeLists + captures.sh)
# c'est-à-dire EXACTEMENT ceux que les cours affichent via <CodeFile> —
# et les captures d'écran du cours sont générées par ce même code
# (captures.sh → --capture).
#
# Usage : scripts/test-solutions-qt.sh [--build|--up]
#   --build (défaut) configure + compile tout (cmake, g++, qt6-base-dev).
#   --up    En plus : exécute les exemples console en vérifiant leurs
#           sorties, et les exemples graphiques en offscreen (--smoke).
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sol="$here/../src/solutions/qt"
build="${TMPDIR:-/tmp}/test-solutions-qt-build"
mode="${1:---build}"

pass=0; fail=0; declare -a failed=()
ok(){ echo "✅ $*"; pass=$((pass+1)); }
ko(){ echo "❌ $*"; fail=$((fail+1)); failed+=("$*"); }

if ! command -v cmake >/dev/null; then
  echo "❌ cmake requis (apt install cmake g++ qt6-base-dev)."; exit 1
fi

# ——— 1. Lint du script de captures ———
if bash -n "$sol/captures.sh"; then ok "bash -n captures.sh"; else ko "bash -n captures.sh"; fi
if command -v shellcheck >/dev/null; then
  if shellcheck "$sol/captures.sh"; then ok "shellcheck captures.sh"; else ko "shellcheck captures.sh"; fi
fi

# ——— 2. Configuration + compilation (AUTOMOC compris) ———
if cmake -S "$sol" -B "$build" -DCMAKE_BUILD_TYPE=Release >/dev/null 2>&1; then
  ok "cmake : configuration (Qt6 trouvé)"
else
  ko "cmake : configuration (qt6-base-dev installé ?)"
  echo; echo "Bilan : $pass OK, $fail KO"; exit 1
fi
if cmake --build "$build" -j"$(nproc)" >/dev/null; then
  ok "compilation des 8 exemples"
else
  ko "compilation"; echo; echo "Bilan : $pass OK, $fail KO"; exit 1
fi

if [ "$mode" = "--up" ]; then
  export QT_QPA_PLATFORM=offscreen

  # ——— 3. Exemples console : sorties attendues ———
  out_obj="$("$build/objet-verbeux" 2>&1)"
  # Cascade destruction order is THE lesson: racine, x, z, y.
  [[ "$out_obj" == *$'Détruit : racine\nDétruit : x\nDétruit : z\nDétruit : y'* ]] \
    && ok "objet-verbeux : destruction en cascade (racine, x, z, y)" || ko "objet-verbeux : ordre de destruction"
  out_sig="$("$build/signaux" 2>&1)"
  [[ "$out_sig" == *"Lambda (int)            : 3"* && "$out_sig" == *"Fonction libre (double) : 3.14"* ]] \
    && ok "signaux : conversions implicites (int 3, double 3.14)" || ko "signaux : conversions"
  out_fic="$("$build/fichiers" 2>&1)"
  [[ "$out_fic" == *"2 : Grace Hopper"* ]] \
    && ok "fichiers : écrit puis relu (QTextStream)" || ko "fichiers : relecture"

  # ——— 4. Exemples graphiques : smoke test offscreen ———
  for gui in hello layouts compteur evenements dessin; do
    if "$build/$gui" --smoke >/dev/null 2>&1; then
      ok "smoke offscreen : $gui"
    else
      ko "smoke offscreen : $gui"
    fi
  done
fi

echo; echo "Bilan : $pass OK, $fail KO"
[ "$fail" -eq 0 ] || { printf ' - %s\n' "${failed[@]}"; exit 1; }
