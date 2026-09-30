# Assets de la VM Alpine

Les binaires de la VM ne sont pas suivis par Git. `site/scripts/prepare-vm-assets.mjs`
les produit avant le build :

- v86 (`libv86.js`, `v86.wasm`, licence) vient du paquet npm verrouillé ;
- les BIOS viennent du dépôt officiel v86 et sont vérifiés par SHA-256 ;
- l'ISO Alpine 3.21 x86 vient des releases officielles et est vérifiée par
  SHA-256 avant un patch en place, de taille identique, qui active
  `console=ttyS0,115200`.

Le répertoire généré `site/public/vm/` est ignoré par Git mais copié dans le
site statique par Astro. Il n'y a donc aucun téléchargement tiers au runtime.
