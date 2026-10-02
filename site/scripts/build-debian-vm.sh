#!/usr/bin/env bash
set -euo pipefail

# Build the small, terminal-only Debian guest used by v86. This intentionally
# creates an initramfs rather than a disk image: the browser downloads only the
# compressed userspace required for the teaching shell.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/vm/debian"
WORK="${TMPDIR:-/tmp}/iadmin-debian-vm"
SUITE="bookworm"
MIRROR="https://deb.debian.org/debian"

if [[ $EUID -ne 0 ]]; then
  echo "build-debian-vm.sh must run as root (debootstrap and device files are required)." >&2
  exit 1
fi
for command in debootstrap cpio gzip; do
  command -v "$command" >/dev/null || { echo "$command is required" >&2; exit 1; }
done

rm -rf "$WORK"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/rootfs" "$OUT"
debootstrap --arch=i386 --variant=minbase --include=linux-image-686,bash-completion,ca-certificates "$SUITE" "$WORK/rootfs" "$MIRROR"

cat > "$WORK/rootfs/init" <<'EOF'
#!/bin/sh
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
mount -t devtmpfs devtmpfs /dev
mkdir -p /dev/pts /proc /sys /run /tmp
mount -t devpts devpts /dev/pts
mount -t proc proc /proc
mount -t sysfs sysfs /sys
hostname iadmin-debian
printf '\033[1;32mDebian GNU/Linux — IAdmin teaching shell\033[0m\n'
printf 'This temporary VM runs entirely in your browser. Files disappear when the page closes.\n\n'
printf 'IADMIN_DEBIAN_READY\n'
exec setsid sh -c 'exec bash -l </dev/ttyS0 >/dev/ttyS0 2>&1'
EOF
chmod 0755 "$WORK/rootfs/init"

# Keep the published guest small and deterministic enough to audit.
rm -rf "$WORK/rootfs/var/cache/apt/archives"/* "$WORK/rootfs/var/lib/apt/lists"/* \
  "$WORK/rootfs/usr/share/doc"/* "$WORK/rootfs/usr/share/man"/* "$WORK/rootfs/boot/initrd.img-"*
kernel=("$WORK/rootfs"/boot/vmlinuz-*)
[[ -f "${kernel[0]}" ]] || { echo "Debian kernel not found" >&2; exit 1; }
cp "${kernel[0]}" "$OUT/bzImage"

# v86 receives the kernel separately. Keeping a second kernel and its complete
# module tree inside the initramfs wastes more than 150 MB of guest RAM and can
# make unpacking fail before /init ever runs. The teaching shell only needs
# drivers compiled into Debian's kernel (serial console, devtmpfs and proc/sys).
rm -rf "$WORK/rootfs/boot" "$WORK/rootfs/lib/modules" "$WORK/rootfs/usr/lib/modules"

(cd "$WORK/rootfs" && find . -xdev -print0 | cpio --null -o --format=newc --quiet | gzip -9) > "$OUT/initrd.gz"
initrd_size=$(stat -c %s "$OUT/initrd.gz")
(( initrd_size < 128 * 1024 * 1024 )) || { echo "Debian initramfs is unexpectedly large: $initrd_size bytes" >&2; exit 1; }
sha256sum "$OUT/bzImage" "$OUT/initrd.gz" > "$OUT/SHA256SUMS"
if [[ -n "${SUDO_UID:-}" && -n "${SUDO_GID:-}" ]]; then
  chown -R "$SUDO_UID:$SUDO_GID" "$OUT"
fi
rm -rf "$WORK"
trap - EXIT
printf 'Debian VM ready: '; du -h "$OUT/bzImage" "$OUT/initrd.gz" | tr '\n' ' '; echo
