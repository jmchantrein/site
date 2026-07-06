#!/usr/bin/env bash
# Harnais frère de test-solutions.sh pour les corrigés Bash et sed/awk
# des modules de la série Outils — pas besoin de Docker.
#
# SOURCE UNIQUE : ce script valide les fichiers de
#   site/src/solutions/outils-admin/bash/    (scripts + suites Bats)
#   site/src/solutions/outils-admin/sed-awk/ (exercices sur data/)
#   site/src/solutions/outils-admin/git/     (rejeu du TP Git)
#   site/src/solutions/miscelanea/           (démos des articles bash)
# c'est-à-dire EXACTEMENT ceux que les cours affichent via <CodeFile>.
#
# Usage : scripts/test-solutions-bash.sh [--lint|--up]
#   --lint  (défaut) shellcheck sur tous les .bash/.sh + bash -n (syntaxe).
#   --up    En plus : exécute les suites Bats (bats requis) et rejoue les
#           exercices sed/awk en vérifiant des sorties attendues.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash_sol="$here/../src/solutions/outils-admin/bash"
sedawk_sol="$here/../src/solutions/outils-admin/sed-awk"
git_sol="$here/../src/solutions/outils-admin/git"
misc_sol="$here/../src/solutions/miscelanea"
mode="${1:---lint}"

pass=0; fail=0; declare -a failed=()
ok(){ echo "✅ $*"; pass=$((pass+1)); }
ko(){ echo "❌ $*"; fail=$((fail+1)); failed+=("$*"); }

# ——— 1. Lint : syntaxe bash + shellcheck ———
for f in "$bash_sol"/*.bash "$sedawk_sol"/*.sh "$git_sol"/*.sh "$misc_sol"/*/*.bash; do
  if bash -n "$f"; then ok "bash -n $(basename "$f")"; else ko "bash -n $(basename "$f")"; fi
  if command -v shellcheck >/dev/null; then
    if shellcheck "$f"; then ok "shellcheck $(basename "$f")"; else ko "shellcheck $(basename "$f")"; fi
  fi
done

if [ "$mode" = "--up" ]; then
  # ——— 2. Suites Bats (les corrigés Bash s'exécutent et s'affirment) ———
  if command -v bats >/dev/null; then
    for suite in "$bash_sol"/*.bats; do
      if bats "$suite"; then ok "bats $(basename "$suite")"; else ko "bats $(basename "$suite")"; fi
    done
  else
    echo "ℹ bats absent : suites non exécutées (apt install bats)."
  fi

  # ——— 3. Exercices sed/awk : sorties attendues ———
  out_sed="$(bash "$sedawk_sol/exercices-sed.sh")"
  [[ "$out_sed" == *"matériel"* ]] \
    && ok "sed : substitution (matériel)" || ko "sed : substitution"
  [[ "$out_sed" == *"Ada Lovelace;"* ]] \
    && ok "sed : capture (Prénom Nom inversés)" || ko "sed : capture"
  [[ "$out_sed" == *"port = disabled"* ]] \
    && ok "sed : séparateur alternatif" || ko "sed : séparateur alternatif"

  out_awk="$(bash "$sedawk_sol/exercices-awk.sh")"
  [[ "$out_awk" == *"Hamilton Margaret 1969"* ]] \
    && ok "awk : filtre numérique (< 1970 inclut 1969)" || ko "awk : filtre numérique"
  # Le filtre < 1970 doit garder exactement 5 lignes (comparaison NUMÉRIQUE).
  n_avant_1970="$(awk -F';' 'NR > 1 && $2 < 1970' "$sedawk_sol/data/pionnieres.csv" | wc -l)"
  [ "$n_avant_1970" -eq 5 ] \
    && ok "awk : filtre numérique (5 lignes < 1970)" || ko "awk : filtre numérique ($n_avant_1970 ≠ 5)"
  [[ "$out_awk" == *"langages 2"* ]] \
    && ok "awk : regroupement par domaine" || ko "awk : regroupement"
  [[ "$out_awk" == *"Total : 15618"* ]] \
    && ok "awk : somme de colonne (15618)" || ko "awk : somme (attendu 15618)"

  # ——— 3 bis. Démos des articles Miscelánea (sorties montrées = réelles) ———
  out_loc="$(bash "$misc_sol/local/portee-locale.bash")"
  [[ "$out_loc" == *"de retour dans main : « modifiée par ___visiteuse »"* ]] \
    && ok "local : portée dynamique (la locale est modifiée par l'appelée)" || ko "local : portée dynamique"
  out_ss="$(bash "$misc_sol/local/portee-sous-shell.bash")"
  [[ "$out_ss" == *"main relit : « modifiée par ___visiteuse »"* && "$out_ss" == *"main relit : « déclarée dans main »"* ]] \
    && ok "local : partage en shell, copie en sous-shell" || ko "local : sous-shell"
  out_ro="$(bash "$misc_sol/local/portee-readonly.bash" 2>&1)"
  [[ "$out_ro" == *"modification refusée"* && "$out_ro" == *"main relit : « gravée dans main »"* ]] \
    && ok "local -r : readonly survit à l'appel et au sous-shell" || ko "local -r : readonly"
  out_ep="$(bash "$misc_sol/local/export-processus.bash")"
  [[ "$out_ep" == *"readonly perdu"* && "$out_ep" == *"toujours readonly"* ]] \
    && ok "export : les attributs ne passent pas au nouveau processus" || ko "export : attributs"
  out_qt="$(bash "$misc_sol/quoting/expansions.bash")"
  [[ "$out_qt" == *$'\nGrace Hopper\n'* && "$out_qt" == *"Grace     Hopper"* ]] \
    && ok "quoting : word splitting (espaces recompactés sans guillemets)" || ko "quoting : word splitting"
  [[ "$out_qt" == *"ada.txt grace.txt hedy.txt"* && "$out_qt" == *$'\n*.txt\n'* ]] \
    && ok "quoting : glob déclenché nu, inerte entre guillemets" || ko "quoting : glob"
  [[ "$out_qt" == *"bonjour Ada Grace Hedy"* ]] \
    && ok "quoting : boucle for sur chaîne quotée = un seul tour" || ko "quoting : boucle for"

  # ——— 4. TP Git : rejeu complet, états vérifiés par le script lui-même ———
  if out_git="$(bash "$git_sol/tp-git.sh" 2>&1)"; then
    [[ "$out_git" == *"OK — revert ajoute"* ]] \
      && ok "git : rejeu du TP (revert ajoute, reset supprime)" || ko "git : sortie inattendue"
  else
    ko "git : le rejeu du TP a échoué"
  fi
fi

echo; echo "Bilan : $pass OK, $fail KO"
[ "$fail" -eq 0 ] || { printf ' - %s\n' "${failed[@]}"; exit 1; }
