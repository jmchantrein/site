#!/usr/bin/env bash
# Harnais frère de test-solutions.sh pour la série KVM.
#
# SOURCE UNIQUE : ce script valide les fichiers de
#   site/src/solutions/kvm/   (scripts hôte + définitions XML libvirt)
# c'est-à-dire EXACTEMENT ceux que les cours affichent via <CodeFile>.
#
# LIMITE ASSUMÉE : exécuter les VM exigerait la virtualisation imbriquée,
# hors de portée de la CI GitHub — on valide donc ce qui est validable
# sans hyperviseur : syntaxe bash, shellcheck, et XML bien formé.
#
# Usage : scripts/test-solutions-kvm.sh
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sol="$here/../src/solutions/kvm"

pass=0; fail=0; declare -a failed=()
ok(){ echo "✅ $*"; pass=$((pass+1)); }
ko(){ echo "❌ $*"; fail=$((fail+1)); failed+=("$*"); }

# ——— 1. Scripts hôte : syntaxe bash + shellcheck ———
for f in "$sol"/*.sh; do
  if bash -n "$f"; then ok "bash -n $(basename "$f")"; else ko "bash -n $(basename "$f")"; fi
  if command -v shellcheck >/dev/null; then
    if shellcheck "$f"; then ok "shellcheck $(basename "$f")"; else ko "shellcheck $(basename "$f")"; fi
  fi
done

# ——— 2. Définitions libvirt : XML bien formé ———
if command -v xmllint >/dev/null; then
  for f in "$sol"/*.xml; do
    if xmllint --noout "$f"; then ok "xmllint $(basename "$f")"; else ko "xmllint $(basename "$f")"; fi
  done
else
  echo "ℹ xmllint absent : XML non validé (apt install libxml2-utils)."
fi

echo; echo "Bilan : $pass OK, $fail KO"
[ "$fail" -eq 0 ] || { printf ' - %s\n' "${failed[@]}"; exit 1; }
