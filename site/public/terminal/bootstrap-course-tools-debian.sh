#!/bin/sh
# Install the non-graphical course toolbox on a Debian workstation used by the
# terminal companion. Docker, OpenSSH, WireGuard, Ansible, Bats, nginx,
# TeX Live, KVM and Qt are intentionally outside this profile.
set -eu

if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
elif command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  printf '%s\n' "Run this script as root, or install sudo first." >&2
  exit 1
fi

$SUDO apt-get update
$SUDO apt-get install -y --no-install-recommends \
  bash bash-completion coreutils findutils grep sed gawk less man-db manpages \
  tar gzip unzip curl wget sudo cron vim-nox pandoc shellcheck git jq yq \
  yamllint tmux tmuxp rsync nftables ufw fail2ban python3 ca-certificates

printf '%s\n' "IAdmin course tools installed."
printf '%s\n' "yq is Debian's jq-compatible Python wrapper, as used by the course."
