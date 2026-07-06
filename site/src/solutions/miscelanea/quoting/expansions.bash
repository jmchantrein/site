#!/bin/bash
# Quoting and expansions, demonstrated. Every unquoted expansion below is
# INTENTIONAL — that is precisely what the demo shows. (The classic
# StackOverflow memo is CC BY-SA; these examples are original.)
set -u

# A sandbox directory so the glob demonstration is deterministic.
sandbox="$(mktemp -d)"
trap 'rm -rf "${sandbox}"' EXIT
cd "${sandbox}" || exit 1
touch ada.txt grace.txt hedy.txt

echo "— 1. Découpage en mots (word splitting) —"
hommage="Grace     Hopper"
# shellcheck disable=SC2086  # intentional: unquoted to show word splitting
echo ${hommage}
echo "${hommage}"

echo "— 2. Une boucle for découpe aussi —"
pionnieres="Ada Grace Hedy"
# shellcheck disable=SC2086  # intentional: unquoted to iterate on words
for p in ${pionnieres}; do echo "  bonjour ${p}"; done
# shellcheck disable=SC2066  # intentional: quoted, so the loop runs ONCE
for p in "${pionnieres}"; do echo "  bonjour ${p}"; done

echo "— 3. Le glob se déclenche sans guillemets —"
motif="*.txt"
# shellcheck disable=SC2086  # intentional: unquoted to trigger globbing
echo ${motif}
echo "${motif}"

echo "— 4. Simples vs doubles guillemets —"
pionniere="Ada Lovelace"
echo "${pionniere}"
# shellcheck disable=SC2016  # intentional: single quotes keep ${…} literal
echo '${pionniere}'
echo "'${pionniere}'"
# shellcheck disable=SC2016  # intentional: same demonstration, nested quotes
echo '"${pionniere}"'

echo "— 5. Échappements et cas limites —"
echo "\${pionniere} vaut ${pionniere}"
echo "un dollar seul en fin de chaîne : 100$"
# shellcheck disable=SC2028  # intentional: showing echo does NOT expand \n \t
echo 'antislash inerte entre simples : \n \t'
# shellcheck disable=SC2028  # intentional: same in double quotes
echo "antislash inerte entre doubles aussi : \n \t"
echo $'mais interprété en ANSI-C ($\x27…\x27) :\n\tnouvelle ligne et tabulation'

echo "— 6. Substitution de commande —"
# shellcheck disable=SC2116  # intentional: a trivial $(…) to show it expands
echo "aujourd'hui : $(echo simulé)"
# shellcheck disable=SC2016  # intentional: single quotes keep $(…) literal
echo 'aujourd'"'"'hui : $(echo simulé)'
