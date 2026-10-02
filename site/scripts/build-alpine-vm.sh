#!/usr/bin/env bash
set -euo pipefail

# Build the offline, terminal-only Alpine guest used by v86. Packages are
# resolved while building the site; the browser VM never needs a network.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/vm/alpine"
WORK="${TMPDIR:-/tmp}/iadmin-alpine-vm"
RELEASE="3.21"
VERSION="3.21.3"
MIRROR="https://dl-cdn.alpinelinux.org/alpine"
MINIROOT="alpine-minirootfs-${VERSION}-x86.tar.gz"

if [[ $EUID -ne 0 ]]; then
  echo "build-alpine-vm.sh must run as root (chroot and device files are required)." >&2
  exit 1
fi
for command in curl cpio gzip python3 qemu-i386-static; do
  command -v "$command" >/dev/null || { echo "$command is required" >&2; exit 1; }
done

rm -rf "$WORK"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/rootfs" "$OUT"
curl --fail --location --proto '=https' --tlsv1.2 \
  "$MIRROR/v${RELEASE}/releases/x86/$MINIROOT" | tar -xz -C "$WORK/rootfs"
cp "$(command -v qemu-i386-static)" "$WORK/rootfs/usr/bin/"
cp -L /etc/resolv.conf "$WORK/rootfs/etc/resolv.conf"
cp -L /etc/hosts "$WORK/rootfs/etc/hosts"
# Preserve an explicitly configured build-host CA (for example an enterprise
# HTTPS proxy) without weakening transport security for Alpine repositories.
if [[ -n "${SSL_CERT_FILE:-}" && -f "$SSL_CERT_FILE" ]]; then
  cat "$SSL_CERT_FILE" >> "$WORK/rootfs/etc/ssl/certs/ca-certificates.crt"
fi
printf '%s\n' \
  "$MIRROR/v${RELEASE}/main" \
  "$MIRROR/v${RELEASE}/community" > "$WORK/rootfs/etc/apk/repositories"

# GNU variants deliberately replace BusyBox where course examples rely on the
# Debian/GNU command-line behaviour. Excluded by editorial decision: Docker,
# OpenSSH, WireGuard, Ansible, Bats, nginx, TeX Live, KVM and Qt.
packages=(
  alpine-base linux-virt bash bash-completion
  coreutils findutils grep sed gawk less mandoc man-pages
  tar gzip unzip curl wget sudo dcron vim git jq yamllint tmux rsync
  nftables ufw fail2ban python3 ca-certificates
)
chroot "$WORK/rootfs" /usr/bin/qemu-i386-static /sbin/apk add --no-cache --no-scripts "${packages[@]}"
# Alpine 3.21 no longer publishes yq/tmuxp for 32-bit x86. Both are pure
# Python, so install their normal upstream packages while the image is built.
# The resulting guest remains fully offline at runtime.
python3 -m pip install --disable-pip-version-check --no-cache-dir --no-deps \
  --target "$WORK/rootfs/usr/lib/python3.12/site-packages" \
  yq==4.4.0 tmuxp==1.74.0 argcomplete==3.7.2 tomlkit==0.15.1 \
  xmltodict==1.0.4 libtmux==0.61.0
cat > "$WORK/rootfs/usr/bin/yq" <<'EOF'
#!/usr/bin/python3
from yq import cli
cli()
EOF
cat > "$WORK/rootfs/usr/bin/tmuxp" <<'EOF'
#!/usr/bin/python3
from tmuxp import cli
cli.cli()
EOF
chmod 0755 "$WORK/rootfs/usr/bin/yq" "$WORK/rootfs/usr/bin/tmuxp"

cat > "$WORK/rootfs/init" <<'EOF'
#!/bin/sh
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
mount -t devtmpfs devtmpfs /dev
mkdir -p /dev/pts /proc /sys /run /tmp /root
mount -t devpts devpts /dev/pts
mount -t proc proc /proc
mount -t sysfs sysfs /sys
hostname iadmin-alpine
printf '\033[1;32mAlpine Linux — IAdmin offline teaching shell\033[0m\n'
printf 'GNU utilities and the course tools are preinstalled; no network is required.\n\n'
printf 'IADMIN_ALPINE_READY\n'
exec setsid sh -c 'exec bash -l </dev/ttyS0 >/dev/ttyS0 2>&1'
EOF
chmod 0755 "$WORK/rootfs/init"

kernel=("$WORK/rootfs"/boot/vmlinuz-virt)
[[ -f "${kernel[0]}" ]] || { echo "Alpine kernel not found" >&2; exit 1; }
cp "${kernel[0]}" "$OUT/bzImage"

# v86 receives the kernel separately. The teaching shell needs only drivers
# compiled into linux-virt, so neither the duplicate kernel nor modules belong
# in the in-memory root filesystem.
rm -rf "$WORK/rootfs/boot" "$WORK/rootfs/lib/modules" "$WORK/rootfs/usr/lib/modules"
rm -f "$WORK/rootfs/usr/bin/qemu-i386-static"
rm -rf "$WORK/rootfs/var/cache/apk"/*
(cd "$WORK/rootfs" && find . -xdev -print0 | cpio --null -o --format=newc --quiet | gzip -9) > "$OUT/initrd.gz"
(cd "$OUT" && sha256sum bzImage initrd.gz > SHA256SUMS)
if [[ -n "${SUDO_UID:-}" && -n "${SUDO_GID:-}" ]]; then chown -R "$SUDO_UID:$SUDO_GID" "$OUT"; fi
rm -rf "$WORK"
trap - EXIT
printf 'Alpine VM ready: '; du -h "$OUT/bzImage" "$OUT/initrd.gz" | tr '\n' ' '; echo
