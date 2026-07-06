#!/bin/bash
# Ansible lab: build the three containers, wire SSH from the control node to
# the managed nodes, replay the module's playbooks, then run them a SECOND
# time and require changed=0 — the idempotence taught by the course, enforced.
# Usage: lab.sh [--keep]   (--keep leaves the lab running for exploration)
set -euo pipefail
cd "$(dirname "$0")"

keep="${1:-}"
cleanup() { [ "$keep" = "--keep" ] || docker compose down --rmi local >/dev/null 2>&1 || true; }
trap cleanup EXIT

ctl() { docker compose exec -T control-node "$@"; }

echo "— build + up (control-node, managed-node-1, managed-node-2)"
docker compose up -d --build

echo "— SSH: key pair on the control node, public key onto the managed nodes"
ctl sh -c "ssh-keygen -t ed25519 -N '' -f /root/.ssh/id_ed25519 -q"
pub="$(ctl cat /root/.ssh/id_ed25519.pub)"
for node in managed-node-1 managed-node-2; do
  docker compose exec -T "$node" sh -c "mkdir -p /root/.ssh && chmod 700 /root/.ssh \
    && printf '%s\n' '$pub' >> /root/.ssh/authorized_keys \
    && chmod 600 /root/.ssh/authorized_keys"
done
# Record the nodes' host keys up front (in real life: verify them!).
ctl sh -c "ssh-keyscan managed-node-1 managed-node-2 >> /root/.ssh/known_hosts 2>/dev/null"

echo "— ad hoc: ansible all -m ping"
ctl ansible all -m ping

echo "— playbooks, first pass (installs and configures everything)"
for pb in hello_world.yml install-common-software.yaml write_hello_world.yaml site-web.yml; do
  ctl ansible-playbook "/etc/ansible/$pb"
done

echo "— the role's page answers on its default port (8080)"
ctl curl -fsS http://managed-node-1:8080/ | grep "Hello world !"

echo "— second pass: idempotence (every recap must say changed=0)"
second="$(for pb in hello_world.yml install-common-software.yaml write_hello_world.yaml site-web.yml; do
  ctl ansible-playbook "/etc/ansible/$pb"
done)"
echo "$second" | grep -E "changed=[0-9]+" || true
if echo "$second" | grep -qE "changed=[1-9]"; then
  echo "KO — a second run still changed something: idempotence is broken."
  exit 1
fi

echo
echo "OK — idempotence verified: second pass changed nothing anywhere."
