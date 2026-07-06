#!/bin/bash
# First VM, from the command line. Requires a KVM-ready host (see
# verifier-hote.sh) and the Debian netinstall ISO (checksum verified!).
# The graphical installer opens in virt-viewer: do NOT install a GUI,
# DO install the SSH server — administration happens over SSH afterwards.
set -euo pipefail

nom_vm="${1:-ma-premiere-vm}"
iso="${2:-$HOME/Téléchargements/debian-13.1.0-amd64-netinst.iso}"

[ -f "$iso" ] || { echo "ISO introuvable : $iso" >&2; exit 1; }

# --osinfo tunes the virtual hardware for the guest OS (list: virt-install
#   --osinfo list); --disk creates a 20 GiB qcow2 volume on the virtio bus;
# --network joins the default NAT network (bridge virbr0);
# --location extracts kernel+initrd from the ISO (text or graphic install).
sudo virt-install \
  --osinfo debian12 \
  --name "$nom_vm" \
  --memory 2048 \
  --vcpus 1 \
  --disk "path=/var/lib/libvirt/images/${nom_vm}.qcow2,bus=virtio,size=20" \
  --network bridge=virbr0 \
  --location "$iso"
