#!/usr/bin/env bash
# Harnais frère pour le mini-labo WireGuard (Docker + module noyau
# wireguard requis — présents sur ubuntu-latest en CI).
# Usage : scripts/test-solutions-wireguard.sh
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
lab="$here/../src/solutions/outils-admin/wireguard"

command -v docker >/dev/null || { echo "❌ docker requis pour le labo WireGuard."; exit 1; }
docker info >/dev/null 2>&1 || { echo "❌ démon Docker injoignable."; exit 1; }

out="$(bash "$lab/lab.sh")"
echo "$out" | tail -5
if [[ "$out" == *"0% packet loss"* && "$out" == *"OK — encrypted tunnel"* ]]; then
  echo "✅ tunnel WireGuard monté et pingé entre les deux conteneurs"
else
  echo "❌ le ping à travers le tunnel a échoué"; exit 1
fi
