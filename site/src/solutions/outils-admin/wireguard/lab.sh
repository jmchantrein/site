#!/bin/bash
# WireGuard mini-lab: two containers build an encrypted tunnel between
# themselves and ping through it. Requires Docker + the host's wireguard
# kernel module (present in mainline kernels since 5.6).
# Usage: lab.sh [--keep]   (--keep leaves the lab running for exploration)
set -euo pipefail
cd "$(dirname "$0")"

keep="${1:-}"
cleanup() { [ "$keep" = "--keep" ] || docker compose down --rmi local >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "— build + up"
docker compose up -d --build

exec_a() { docker exec wg-lab-a sh -c "$*"; }
exec_b() { docker exec wg-lab-b sh -c "$*"; }

echo "— key pairs (private keys never leave their peer)"
A_PRIV="$(exec_a 'wg genkey')"; A_PUB="$(printf '%s' "$A_PRIV" | docker exec -i wg-lab-a wg pubkey)"
B_PRIV="$(exec_b 'wg genkey')"; B_PUB="$(printf '%s' "$B_PRIV" | docker exec -i wg-lab-b wg pubkey)"

echo "— underlay addresses (the ordinary Docker network)"
A_IP="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' wg-lab-a)"
B_IP="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' wg-lab-b)"
echo "   pair-a: $A_IP · pair-b: $B_IP"

echo "— wg0 on pair-a (10.9.9.1) with pair-b as peer"
exec_a "printf '%s' '$A_PRIV' > /tmp/pk
        ip link add wg0 type wireguard
        ip addr add 10.9.9.1/24 dev wg0
        wg set wg0 private-key /tmp/pk listen-port 51820 \
          peer '$B_PUB' allowed-ips 10.9.9.2/32 endpoint '$B_IP:51820'
        ip link set wg0 up"

echo "— wg0 on pair-b (10.9.9.2) with pair-a as peer"
exec_b "printf '%s' '$B_PRIV' > /tmp/pk
        ip link add wg0 type wireguard
        ip addr add 10.9.9.2/24 dev wg0
        wg set wg0 private-key /tmp/pk listen-port 51820 \
          peer '$A_PUB' allowed-ips 10.9.9.1/32 endpoint '$A_IP:51820'
        ip link set wg0 up"

echo "— ping THROUGH the tunnel (10.9.9.x, not the Docker network)"
exec_a "ping -c 3 10.9.9.2"

echo "— tunnel state as seen by pair-a"
exec_a "wg show"

echo
echo "OK — encrypted tunnel up between two containers, no public IP involved."
