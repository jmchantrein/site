#!/usr/bin/env bash
# Harnais frère de test-solutions.sh pour la série Ansible.
#
# SOURCE UNIQUE : ce script valide les fichiers de
#   site/src/solutions/ansible/   (ansible.cfg, inventaire, playbooks,
#                                  rôle nginx_hello_world, labo Docker)
# c'est-à-dire EXACTEMENT ceux que les cours affichent via <CodeFile>.
#
# Usage : scripts/test-solutions-ansible.sh [--lint|--up]
#   --lint  (défaut) bash -n + shellcheck sur les scripts ; ansible-lint et
#           ansible-playbook --syntax-check si disponibles.
#   --up    En plus : lance le labo Docker complet (lab.sh) — 3 conteneurs,
#           SSH, rejeu des playbooks, curl de la page, et SECOND passage
#           exigé à changed=0 : le test CI incarne l'idempotence enseignée.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sol="$here/../src/solutions/ansible"
mode="${1:---lint}"

pass=0; fail=0; declare -a failed=()
ok(){ echo "✅ $*"; pass=$((pass+1)); }
ko(){ echo "❌ $*"; fail=$((fail+1)); failed+=("$*"); }

# ——— 1. Lint : scripts shell du labo et du hook ———
for f in "$sol/lab/lab.sh" "$sol/hooks/pre-commit"; do
  if bash -n "$f"; then ok "bash -n $(basename "$f")"; else ko "bash -n $(basename "$f")"; fi
  if command -v shellcheck >/dev/null; then
    if shellcheck "$f"; then ok "shellcheck $(basename "$f")"; else ko "shellcheck $(basename "$f")"; fi
  fi
done

# ——— 2. Lint Ansible : playbooks + rôle (ansible-lint embarque yamllint) ———
if command -v ansible-lint >/dev/null; then
  if (cd "$sol" && ansible-lint hello_world.yml install-common-software.yaml \
        write_hello_world.yaml site-web.yml); then
    ok "ansible-lint (playbooks + rôle)"
  else
    ko "ansible-lint"
  fi
else
  echo "ℹ ansible-lint absent : lint Ansible non exécuté (apt install ansible-lint)."
fi

# ——— 3. Syntaxe des playbooks (sans se connecter aux nœuds) ———
if command -v ansible-playbook >/dev/null; then
  # -i explicite : l'inventaire de ansible.cfg pointe /etc/ansible (le labo).
  for pb in hello_world.yml install-common-software.yaml write_hello_world.yaml site-web.yml; do
    if (cd "$sol" && ansible-playbook -i inventory/hosts.yaml \
          --syntax-check "$pb" >/dev/null); then
      ok "syntax-check $pb"
    else
      ko "syntax-check $pb"
    fi
  done
else
  echo "ℹ ansible absent : syntax-check non exécuté."
fi

# ——— 4. Labo complet (Docker requis) ———
if [ "$mode" = "--up" ]; then
  if ! command -v docker >/dev/null || ! docker info >/dev/null 2>&1; then
    ko "docker requis pour le labo Ansible"
  else
    if out="$(bash "$sol/lab/lab.sh" 2>&1)"; then
      echo "$out" | tail -3
      [[ "$out" == *"Hello world !"* ]] \
        && ok "labo : la page du rôle répond sur 8080" || ko "labo : page absente"
      [[ "$out" == *"OK — idempotence"* ]] \
        && ok "labo : second passage à changed=0 (idempotence)" || ko "labo : idempotence brisée"
    else
      echo "$out" | tail -20
      ko "labo : lab.sh a échoué"
    fi
  fi
fi

echo; echo "Bilan : $pass OK, $fail KO"
[ "$fail" -eq 0 ] || { printf ' - %s\n' "${failed[@]}"; exit 1; }
