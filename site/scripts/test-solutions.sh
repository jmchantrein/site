#!/usr/bin/env bash
# Test E2E des corrigés Docker : TP « Conteneurisation d'un service WordPress »
# + cours « Créer ses images Docker » (multistage).
#
# SOURCE UNIQUE : ce script construit/teste les fichiers de
#   site/src/solutions/  (tp-docker-wordpress/ et docker-images/)
# c'est-à-dire EXACTEMENT ceux que le cours affiche via <CodeFile>.
# Portée : échoue si un corrigé ne construit pas, ne démarre pas, ne sert pas la
# page attendue (HTTP + contenu « WordPress »), ou si un binaire ne produit pas
# la sortie attendue. Smoke test : l'installation interactive de WordPress n'est
# pas déroulée (la création user/base est néanmoins exercée au build).
#
# Usage : scripts/test-solutions.sh [--lint|--build|--up] [--no-cache] [--only N] [--keep]
#   --lint      Validation rapide sans construire (docker build --check + compose config).
#   --build     (défaut) Construit toutes les images + valide les fichiers compose.
#   --up        Construit, démarre, teste en HTTP (curl), puis nettoie.
#   --no-cache  Construit sans cache.
#   --only N    Ne teste que l'étape N (1..8) ou le cas « multistage ».
#   --keep      Ne nettoie pas (images/conteneurs/volumes) en fin de test.
#
# Prérequis : démon Docker accessible + accès réseau (apt, wordpress.org, Docker Hub).
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sol="$here/../src/solutions/tp-docker-wordpress"
sol_images="$here/../src/solutions/docker-images"
mode="build"; nocache=""; only=""; keep=""

while [ $# -gt 0 ]; do
  case "$1" in
    --lint)  mode="lint" ;;
    --build) mode="build" ;;
    --up)    mode="up" ;;
    --no-cache) nocache="--no-cache" ;;
    --only)  only="${2:-}"; shift ;;
    --keep)  keep="1" ;;
    -h|--help) sed -n '2,21p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $1" >&2; exit 2 ;;
  esac
  shift
done

command -v docker >/dev/null || { echo "❌ docker introuvable dans le PATH."; exit 1; }
docker info >/dev/null 2>&1 || { echo "❌ démon Docker injoignable (docker info a échoué)."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ plugin 'docker compose' (v2) requis."; exit 1; }

pass=0; fail=0; declare -a failed=()
ok(){ echo "✅ $*"; pass=$((pass+1)); }
ko(){ echo "❌ $*"; fail=$((fail+1)); failed+=("$*"); }
want(){ [ -z "$only" ] || [ "$only" = "$1" ]; }

# Conteneurs/volumes créés par le test, nettoyés en sortie (sauf --keep).
TAGS="wp-tp-test"
trap 'teardown' EXIT
teardown(){
  [ -n "$keep" ] && return 0
  docker rm -f $(docker ps -aq --filter "label=$TAGS") >/dev/null 2>&1 || true
  docker volume rm -f data_wordpress src_wordpress mysql_wordpress my_src_wordpress >/dev/null 2>&1 || true
}

# Attend qu'une URL réponde 2xx/3xx (WordPress : page d'installation ou redirection).
smoke(){ # $1 url
  local url="$1" i code
  for i in $(seq 1 60); do
    code="$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
    case "$code" in 2??|3??) return 0 ;; esac
    sleep 2
  done
  return 1
}

# Vérifie que le corps de la page (redirections suivies) contient un motif.
# NB : on CAPTURE la réponse puis on teste en bash pur. Un « curl | grep -q »
# échouerait sous pipefail : grep -q s'arrête au 1er match et ferme le tube,
# curl reçoit alors SIGPIPE et sort en erreur → faux négatif.
body_has(){ # $1 url  $2 motif
  local body; body="$(curl -sL --max-time 20 "$1" 2>/dev/null || true)"
  [[ "$body" == *"$2"* ]]
}

lint_dockerfile(){ # $1 dir
  if docker build --help 2>/dev/null | grep -q -- '--check'; then
    docker build --check "$1" && ok "lint Dockerfile $(basename "$1")" || ko "lint Dockerfile $(basename "$1")"
  else
    echo "—— docker build --check indisponible (Docker < 25 ?) : lint Dockerfile ignoré pour $1"
  fi
}

# Étape « image unique » : build, et si --up, run + smoke + nettoyage.
test_image(){ # $1 step  $2 dir  $3 path-de-test (ex: / ou /wordpress)
  local step="$1" dir="$2" path="$3" tag="wp-tp-$1" cid
  want "$step" || return 0
  note_step "$step" "$dir"
  if [ "$mode" = "lint" ]; then lint_dockerfile "$dir"; return 0; fi
  if docker build $nocache -t "$tag" "$dir"; then ok "build étape $step"; else ko "build étape $step"; return 0; fi
  [ "$mode" = "up" ] || return 0
  cid="$(docker run -d --label "$TAGS" -p 8080:80 "$tag")"
  if smoke "http://localhost:8080$path"; then
    ok "HTTP étape $step ($path)"
    if body_has "http://localhost:8080$path" "WordPress"; then ok "contenu WordPress étape $step"; else ko "contenu WordPress étape $step"; docker logs "$cid" 2>&1 | tail -20; fi
  else
    ko "HTTP étape $step ($path)"; docker logs "$cid" 2>&1 | tail -20
  fi
  docker rm -f "$cid" >/dev/null 2>&1 || true
}

# Étape « compose » : config (+ build) et si --up, up + smoke + down.
test_compose(){ # $1 step  $2 dir  $3 file  $4 url  $5 home_tmp(0/1)
  local step="$1" dir="$2" file="$3" url="$4" htmp="$5" env=(env)
  want "$step" || return 0
  note_step "$step" "$dir/$file"
  [ "$htmp" = "1" ] && { local H; H="$(mktemp -d)"; mkdir -p "$H/source_code_wordpress" "$H/data_wordpress"; env=(env "HOME=$H"); }
  if "${env[@]}" docker compose -f "$dir/$file" config >/dev/null; then ok "compose config étape $step"; else ko "compose config étape $step"; return 0; fi
  if [ "$mode" = "lint" ]; then return 0; fi
  ( cd "$dir" && "${env[@]}" docker compose -f "$file" build $nocache ) && ok "compose build étape $step" || { ko "compose build étape $step"; return 0; }
  [ "$mode" = "up" ] || return 0
  ( cd "$dir" && "${env[@]}" docker compose -f "$file" up -d )
  if smoke "$url"; then
    ok "HTTP étape $step ($url)"
    if body_has "$url" "WordPress"; then ok "contenu WordPress étape $step"; else ko "contenu WordPress étape $step"; ( cd "$dir" && "${env[@]}" docker compose -f "$file" logs 2>&1 | tail -30 ); fi
  else
    ko "HTTP étape $step ($url)"; ( cd "$dir" && "${env[@]}" docker compose -f "$file" logs 2>&1 | tail -30 )
  fi
  ( cd "$dir" && "${env[@]}" docker compose -f "$file" down -v >/dev/null 2>&1 ) || true
}

note_step(){ echo; echo "==================== Étape $1 — $2 ===================="; }

# Corrigé « binaire » : build, et si --up, run (args optionnels) + vérifie la sortie.
test_run_image(){ # $1 label  $2 dir  $3 motif-attendu  [$4… args de run]
  local label="$1" dir="$2" want_out="$3"; shift 3
  want "$label" || return 0
  note_step "$label" "$dir"
  if [ "$mode" = "lint" ]; then lint_dockerfile "$dir"; return 0; fi
  if docker build $nocache -t "wp-tp-$label" "$dir"; then ok "build $label"; else ko "build $label"; return 0; fi
  [ "$mode" = "up" ] || return 0
  local out; out="$(docker run --rm "wp-tp-$label" "$@" 2>&1 || true)"
  if [[ "$out" == *"$want_out"* ]]; then ok "run $label (sortie attendue)"; else ko "run $label (sortie inattendue : $out)"; fi
}

# --- Étapes -----------------------------------------------------------------
test_image 1 "$sol/1_wordpress_multiservice_dirty"        /wordpress
test_image 2 "$sol/2_wordpress_multiservice_better"       /
test_image 3 "$sol/3_wordpress_multiservice_noroot"       /
test_image 4 "$sol/4_wordpress_multiservice_persistant"   /

# Étape 5 : 2 microservices + script (build_and_launch.sh, avec --link).
if want 5; then
  note_step 5 "$sol/5_wordpress_microservice_persistant"
  d="$sol/5_wordpress_microservice_persistant"
  if [ "$mode" = "lint" ]; then
    lint_dockerfile "$d/apache_wordpress"; lint_dockerfile "$d/mysql_wordpress"
  else
    if docker build $nocache -t wp-tp-5-apache "$d/apache_wordpress" \
       && docker build $nocache -t wp-tp-5-mysql "$d/mysql_wordpress"; then ok "build étape 5"; else ko "build étape 5"; fi
    if [ "$mode" = "up" ]; then
      docker rm -f my_mysql_container my_apache_wordpress_container >/dev/null 2>&1 || true
      docker run -d --label "$TAGS" --name my_mysql_container --hostname my_mysql_container -v data_wordpress:/var/lib/mysql wp-tp-5-mysql
      docker run -d --label "$TAGS" --name my_apache_wordpress_container --hostname my_apache_wordpress_container -p 8080:80 -v src_wordpress:/var/www/html --link my_mysql_container:db wp-tp-5-apache
      if smoke "http://localhost:8080/"; then
        ok "HTTP étape 5 (/)"
        if body_has "http://localhost:8080/" "WordPress"; then ok "contenu WordPress étape 5"; else ko "contenu WordPress étape 5"; docker logs my_apache_wordpress_container 2>&1 | tail -20; fi
      else
        ko "HTTP étape 5 (/)"; docker logs my_apache_wordpress_container 2>&1 | tail -20
      fi
      docker rm -f my_mysql_container my_apache_wordpress_container >/dev/null 2>&1 || true
    fi
  fi
fi

# Étape 6 : compose (build local), service apache exposé en 80.
test_compose 6 "$sol/6_wordpress_microservice_compose" compose.yaml "http://localhost:80/" 0
# Étapes 7 et 8 : images officielles, WordPress exposé en 8080. La 8 monte des dossiers de $HOME.
test_compose 7 "$sol/7_wordpress_official_stack" stack_wordpress.yml "http://localhost:8080/" 0
test_compose 8 "$sol/8_my_final_wordpress"       stack_wordpress.yml "http://localhost:8080/" 1

# Cours « Créer ses images » : corrigés autonomes (build + run + sortie attendue).
test_run_image multistage        "$sol_images/multistage-scratch"   "Hello from a multi-stage build"
test_run_image dockerfile-ping   "$sol_images/dockerfile-ping"      "received"  ping -c 1 localhost
test_run_image cmd-vs-entrypoint "$sol_images/cmd-vs-entrypoint"    "2 received"

# --- Bilan ------------------------------------------------------------------
echo; echo "================== Bilan : $pass OK, $fail KO =================="
if [ "$fail" -gt 0 ]; then printf '  - %s\n' "${failed[@]}"; exit 1; fi
echo "Tous les corrigés testés sont valides. 🎉"
