#!/usr/bin/env bash
# Harnais frère de test-solutions.sh pour les corrigés YAML/JSON du module
# « YAML & JSON » (série Outils) — pas besoin de Docker.
#
# SOURCE UNIQUE : ce script valide les fichiers de
#   site/src/solutions/outils-admin/yaml/
# c'est-à-dire EXACTEMENT ceux que le cours affiche via <CodeFile>.
#
# Usage : scripts/test-solutions-yaml.sh [--lint|--up]
#   --lint  (défaut) Chaque .yaml parse (yamllint si présent, sinon PyYAML) ;
#           livres.json parse et contient les MÊMES données que livres.yaml ;
#           les ancres/alias de livres-ancres.yaml se résolvent comme attendu.
#   --up    En plus : rejoue requetes-yq.sh (sur une COPIE) et vérifie les
#           sorties attendues, yq (saveur Python) ou jq en repli.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sol="$here/../src/solutions/outils-admin/yaml"
mode="${1:---lint}"

pass=0; fail=0; declare -a failed=()
ok(){ echo "✅ $*"; pass=$((pass+1)); }
ko(){ echo "❌ $*"; fail=$((fail+1)); failed+=("$*"); }

command -v python3 >/dev/null || { echo "❌ python3 requis."; exit 1; }
python3 -c "import yaml" 2>/dev/null || { echo "❌ PyYAML requis (python3-yaml)."; exit 1; }

# ——— 1. Chaque fichier YAML est valide ———
for f in "$sol"/*.yaml; do
  if command -v yamllint >/dev/null; then
    if yamllint -d "{extends: default, rules: {line-length: {max: 120}}}" "$f" >/dev/null
    then ok "yamllint $(basename "$f")"; else ko "yamllint $(basename "$f")"; fi
  fi
  if python3 -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" "$f"
  then ok "parse $(basename "$f")"; else ko "parse $(basename "$f")"; fi
done

# ——— 2. livres.json ≡ livres.yaml (mêmes données, deux syntaxes) ———
if python3 - "$sol" << 'PY'
import json, sys, yaml
sol = sys.argv[1]
y = yaml.safe_load(open(f"{sol}/livres.yaml"))
j = json.load(open(f"{sol}/livres.json"))
sys.exit(0 if y == j else 1)
PY
then ok "livres.json ≡ livres.yaml"; else ko "livres.json ≡ livres.yaml"; fi

# ——— 3. Ancres/alias : la fusion se résout comme le cours l'explique ———
if python3 - "$sol" << 'PY'
import sys, yaml
sol = sys.argv[1]
d = yaml.safe_load(open(f"{sol}/livres-ancres.yaml"))
livres = {l["titre"]: l for l in d["livres"]}
a = livres["Le meilleur des mondes"]["auteur"]
b = livres["1984"]["auteur"]
assert a["nom"] == "Aldous Huxley" and a["naissance"] == 1894, "alias auteur_defaut"
assert isinstance(a["naissance"], int), "!!int"
assert b["nom"] == "George Orwell" and b["naissance"] == 1903, "surcharge via <<"
assert b["nationalite"] == "britannique", "champ hérité de l'ancre"
PY
then ok "ancres/alias/surcharge (livres-ancres.yaml)"; else ko "ancres/alias/surcharge"; fi

# ——— 4. --up : rejouer les requêtes yq et vérifier les sorties ———
if [ "$mode" = "--up" ]; then
  tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
  cp "$sol"/livres.yaml "$sol"/requetes-yq.sh "$tmp/"
  # Saveur Python de yq (wrapper jq) : usage mentionne « jq filter ».
  if command -v yq >/dev/null && yq --help 2>&1 | grep -qi "jq filter"; then
    out="$(cd "$tmp" && bash requetes-yq.sh)"
    [[ "$out" == *"Le meilleur des mondes"* && "$out" == *"Les portes de la perception"* ]] \
      && ok "yq : titres de Huxley" || ko "yq : titres de Huxley"
    grep -q "2024" "$tmp/livres.yaml" && ok "yq -yi : 1984 → 2024 (in-place)" || ko "yq -yi in-place"
    python3 -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" "$tmp/livres.yaml" \
      && ok "le fichier réécrit reste du YAML valide" || ko "YAML réécrit invalide"
  elif command -v jq >/dev/null; then
    # Repli : mêmes requêtes via conversion PyYAML → jq.
    out="$(python3 -c "import yaml,json,sys; print(json.dumps(yaml.safe_load(open('$tmp/livres.yaml'))))" \
      | jq -r '.livres[] | select(.auteur == "Aldous Huxley") | .titre')"
    [[ "$out" == *"Le meilleur des mondes"* ]] && ok "jq (repli) : titres de Huxley" || ko "jq (repli)"
  else
    echo "ℹ ni yq ni jq : requêtes non rejouées (lint seul)."
  fi
fi

echo; echo "Bilan : $pass OK, $fail KO"
[ "$fail" -eq 0 ] || { printf ' - %s\n' "${failed[@]}"; exit 1; }
