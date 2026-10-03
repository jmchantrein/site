# Assets des VM du terminal

Les binaires des VM ne sont pas suivis par Git. `site/scripts/prepare-vm-assets.mjs`
copie v86 depuis le paquet npm verrouillé et télécharge les BIOS officiels en
vérifiant leur SHA-256.

Les deux systèmes invités sont construits séparément en noyau + initramfs :

- `scripts/build-alpine-vm.sh` part du minirootfs Alpine 3.21 x86 et installe
  au build les variantes GNU et les outils de cours retenus. La VM est donc
  utilisable sans réseau ; Docker, OpenSSH, WireGuard, Ansible, Bats, nginx,
  TeX Live, KVM et Qt en sont volontairement absents ;
- `scripts/build-debian-vm.sh` conserve une Debian minimale pour les exercices
  qui veulent observer le comportement natif de Debian.

Le profil Alpine remplace notamment les applets BusyBox par `coreutils`,
`findutils`, GNU `grep`, GNU `sed`, `gawk`, GNU `tar` et GNU `wget`. Il ajoute
Bash, Vim, Git, jq, yamllint, tmux, tmuxp, le `yq` Python compatible avec jq,
rsync et les outils de pare-feu. Pandoc et ShellCheck, indisponibles en x86
dans Alpine 3.21, restent accessibles avec le bootstrap Debian du compagnon.

```bash
sudo site/scripts/build-alpine-vm.sh
sudo site/scripts/build-debian-vm.sh
```

Le répertoire généré `site/public/vm/` est ignoré par Git mais copié dans le
site statique par Astro. Il n'y a donc aucun téléchargement tiers au runtime.
