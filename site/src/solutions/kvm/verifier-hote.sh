#!/bin/bash
# Is this host ready for KVM? Three checks, in dependency order:
# 1. the CPU exposes hardware virtualization (vmx = Intel VT-x, svm = AMD-V);
# 2. the kvm kernel module is loaded and /dev/kvm exists;
# 3. the libvirtd daemon is running.
# The script reports; it does not fix. Exit code 0 = everything is ready.
set -euo pipefail

ready=0

if grep -qE 'vmx|svm' /proc/cpuinfo; then
  n="$(grep -cE 'vmx|svm' /proc/cpuinfo)"
  echo "✔ CPU : virtualisation matérielle présente (${n} threads vmx/svm)"
else
  echo "✘ CPU : ni vmx ni svm dans /proc/cpuinfo"
  echo "  → vérifier que la virtualisation est activée dans le firmware (BIOS/UEFI)"
  ready=1
fi

if [ -e /dev/kvm ]; then
  echo "✔ noyau : /dev/kvm présent (module kvm chargé)"
else
  echo "✘ noyau : /dev/kvm absent"
  echo "  → sudo modprobe kvm_intel (ou kvm_amd)"
  ready=1
fi

if systemctl is-active --quiet libvirtd 2>/dev/null; then
  echo "✔ libvirtd : actif"
else
  echo "✘ libvirtd : inactif ou absent"
  echo "  → sudo apt install virt-manager && sudo systemctl enable --now libvirtd"
  ready=1
fi

exit "$ready"
