# Plan d'intégration — « Outils de l'administration système » + « Ansible »

Proposition issue de la lecture intégrale des sources (juillet 2026),
cadrée avec l'auteur (8 décisions validées, rappelées ⬥ ci-dessous).
Les sources sont déposées dans `sources/outils_admin_sys/`,
`sources/ansible/`, `sources/yaml_et_json/`, `sources/markdown/`.

## 1. Sources lues

| Source | Format | Contenu | Licence |
|---|---|---|---|
| `outils_admin_sys/partie_1` | Beamer (2 040 l.) | Vim, Markdown, Bash, sed, awk, SSH, WireGuard | CC BY-NC-SA 3.0 |
| `outils_admin_sys/partie_2` | Beamer (472 l.) | Git (exercice + correction pas-à-pas) | CC BY-NC-SA 3.0 |
| `yaml_et_json` (dépôt) | Markdown | Cours YAML/JSON + 5 exercices | CC BY-NC-SA 4.0 |
| `markdown` (dépôt) | Markdown | Présentation du langage Markdown | CC BY-NC-SA 4.0 |
| `ansible` (TP) | Markdown balisé | TP Ansible 9 h, corrections intégrées | (aucune déclarée) |
| `sed-awk-tutoriel` (fork) | Markdown + data | Dojo sed/awk, auteur d'origine Ben Einaudi | **aucune — non intégrable** |
| `subtilites_bash` (lot 2) | Scripts bash | Portée dynamique de `local`, sous-shells, export/nohup, mémo quoting | (aucune déclarée) |
| `virtualisation` (lot 2) | Markdown | Début de cours KVM/QEMU/libvirt (inspiration xavki) | (aucune déclarée) |
| Cours Qt (lot 2) | — | **Archive non reçue** — à re-téléverser | — |
| Santini, IntroSysteme_Cours_1.pdf | — | Inspiration structure du cours découverte — **inaccessible depuis l'environnement (403)**, à téléverser | (droits tiers : inspiration seulement, zéro reprise) |

## 2. Architecture retenue

⬥ **Deux séries** (décision auteur) : une série « Outils » et une série
« Ansible » séparée — Ansible est l'aboutissement qui mobilise tous les
autres outils et pèse 9 h à lui seul.

⬥ **Bash scindé en deux modules** (segmentation — Sweller) ;
⬥ **module « Ansible : concepts » ajouté** devant le TP ;
⬥ **`order` renumérotés** pour que l'index reflète le parcours
pédagogique complet (lot 2 inclus, cf. § 10) :
Découverte (1+) → Outils (10+) → Ansible (20+) → Virtualisation KVM
(25+) → Docker (30+ ; édition mécanique du frontmatter des pages
Docker FR/EN existantes) → Qt (40+, en attente de l'archive).

### Série `outils-admin` — « Outils de l'administration système » (9 modules)

| # | Slug | Titre | `order` | Durée source | Particularités |
|---|---|---|---|---|---|
| 01 | `vim` | Vim : éditer sans interface graphique | 10 | 2 h | exercices + `vimtutor` |
| 02 | `markdown` | Markdown : documenter en texte brut | 11 | 2 h | volets « source / rendu » |
| 03 | `bash-bases` | Bash : les bases du shell | 12 | 2,5 h | terminal: true, `<Cmd>` |
| 04 | `bash-scripts` | Bash : écrire des scripts robustes | 13 | 2,5 h | corrigés testables (shellcheck + bats) |
| 05 | `sed-awk` | sed & awk : traiter des flux de texte | 14 | — | exercices **réécrits** (cf. § 5) |
| 06 | `ssh` | SSH : accès distants sécurisés | 15 | 2 h | + section tmux (promue depuis « digression ») |
| 07 | `wireguard` | WireGuard : VPN moderne | 16 | 2 h | + mini-labo Docker optionnel (cf. § 6) |
| 08 | `git` | Git : versionner et collaborer | 17 | 3 h | correction pas-à-pas → `<Exercise>` |
| 09 | `yaml-json` | YAML & JSON : structurer des données | 18 | 2 h | 5 exercices, corrigés yamllint/yq |

Frontmatter type : `serie: outils-admin`, `topics: [linux]`,
`badge: "Fondations"` (TP-heavy : `badge: "TP"`), `duration` estimée en
minutes de lecture, `terminal: true` pour bash/sed-awk/git/yaml.

### Série `ansible` — « Ansible : automatiser les configurations » (2 modules)

| # | Slug | Titre | `order` | Contenu |
|---|---|---|---|---|
| 01 | `ansible-concepts` | Ansible : concepts | 20 | inventaire, modules, playbooks, idempotence, rôles, collections, vault (~15-20 min, schémas control node / managed nodes) |
| 02 | `tp-ansible` | TP : de l'inventaire aux rôles | 21 | le TP source, généralisé (cf. § 6) |

⬥ Le TP reste « documentation-first » (renvoi vers docs.ansible.com
assumé pédagogiquement) ; le module concepts donne le vocabulaire
minimal avant d'entrer dans le TP.

### Provenance (déclarée une fois par série, mécanisme existant)

- `outils-admin` fr : `by: human, reviewedBy: ai, aiShare: ~30`
  (fond de l'auteur ; l'IA convertit les diapos en prose de manuel et
  réécrit les exercices sed/awk). en : `translated: ai, aiShare: ~65`.
- `ansible` fr : `by: mixed, aiShare: ~45` (TP de l'auteur, mais module
  concepts rédigé par IA et labo générique réécrit — relecture auteur
  indispensable avant publication). en : `translated: ai`.

## 3. Principes de conversion (identiques à la série Docker)

1. **Diapos → prose de manuel.** Les frames Beamer deviennent des
   sections courtes ; `block`/`exampleblock`/`alertblock` →
   `<Note type="info|success|warning|danger">` ; listes à puces
   resserrées en paragraphes quand elles portaient une seule idée.
2. **Exercices → `<Exercise id levels>`** avec solution dans
   `<Fragment slot="solution">` (verrouillée — testing effect). La
   correction Git en 10 étapes devient 10 exercices enchaînés, chacun
   avec sa solution. Le mécanisme `DEBUT/FIN CORRECTION` du TP Ansible
   est remplacé par ce composant (c'est exactement ce qu'il encode).
3. **Corrigés testables (mécanisme imposé du projet).** Aucun corrigé
   de code en dur dans le MDX :
   - `site/src/solutions/outils-admin/bash/…` — les 8 scripts de
     `code/` + corrigés d'exercices ; harnais : shellcheck en `--lint`,
     **bats** en `--up` (nouveau cas dans `test-solutions.sh`).
   - `site/src/solutions/outils-admin/git/…` — script de rejeu qui
     exécute la séquence du TP dans un dépôt temporaire et vérifie les
     états (`git log --oneline | wc -l`, contenu du fichier) ; les
     sorties montrées dans le cours sont **régénérées réellement**
     (les sorties factices de la source contiennent des incohérences,
     cf. § 7).
   - `site/src/solutions/outils-admin/yaml/…` — `livres.yaml` & co ;
     harnais : yamllint + assertions `yq`.
   - `site/src/solutions/outils-admin/wireguard/…` — mini-labo compose
     (cf. § 6).
   - `site/src/solutions/ansible/…` — labo compose + playbooks + rôle
     `nginx_hello_world` ; harnais : `ansible-lint` en `--lint` ; en
     `--up` : démarrage du labo, exécution des playbooks, `curl` du
     nginx, **second passage pour vérifier l'idempotence
     (`changed=0`)** — le test CI incarne la notion enseignée.
4. **Commandes cliquables** `<Cmd>`/`<TermLine>` pour toutes les
   démonstrations terminal (sed, awk, yq, git…), sorties simulées
   fidèles ; la pratique réelle passe par les modes JSLinux/ttyd du
   dock.
5. **Traduction EN systématique** de chaque module dans le même lot
   (`src/content/cours/en/…`), règle projet.
6. **Aucune ressource externe au runtime** : le logo Wikipedia de
   l'exemple d'image Markdown devient un asset local ; openvim,
   GameShell, explainshell, vim-adventures, quickstart WireGuard, docs
   Ansible, vidéos Xavki restent des **liens** (autorisés).
7. **Écriture inclusive conservée** (« utilisateurices »,
   « Certain·e·s ») — choix d'auteur, pas une coquille.

## 4. Schémas à droite du texte (décision transverse, demande auteur)

Constat : les schémas sont aujourd'hui des blocs dans le flux
(`<ArchiStack>` dans conteneurs-vs-vm ; `<LayerStack>`/`<BuildStack>`
dans des `<Slides>` où texte et figure sont déjà appariés par diapo).

Proposition : un composant de mise en page contraint, `<Duo>` :

- grille 2 colonnes **dans** la colonne de lecture — prose (~58 %) à
  gauche, média (~42 %) à droite, la figure adjacente au paragraphe
  qu'elle illustre (principe de **contiguïté spatiale** de Mayer, qui
  réduit l'attention partagée) ;
- repli en pile (média sous le texte = comportement actuel) sous un
  seuil de largeur **du conteneur** (container query, pas viewport :
  la colonne de lecture est réglable 56–96 ch et le terminal peut
  occuper la droite) ; idem à l'impression ;
- réservé aux figures **verticales/compactes** lisibles à ~40 % de
  largeur : `ArchiStack`, `LayerStack`, futurs schémas (défi
  clé publique/privée SSH, tunnel WireGuard, cycle
  `add`→`commit`→`push`, arbre YAML↔JSON). Les figures larges
  (`BuildStack` 8 couches, tableaux) restent pleine largeur ; dans
  `<Slides>`, rien ne change.

Rétrofit : les deux `<ArchiStack>` de `conteneurs-vs-vm.mdx` (FR + EN)
passent en `<Duo>` — cas d'école cité par l'auteur.

## 5. sed & awk : exercices réécrits (droits)

⬥ Décision auteur. Le dépôt d'origine (`softsam/sed-awk-tutoriel`,
auteur Ben Einaudi) ne porte **aucune licence** → tous droits réservés,
republication impossible. Le module du site :

- garde la **théorie** des diapos de la partie 1 (substitution,
  suppression, insertion, `-i`, séparateurs, ER, groupes de capture ;
  champs, conditions, calculs, sommes, regex awk) ;
- reçoit des **exercices originaux** au format dojo progressif :
  nouveaux jeux de données (fichiers réels sous
  `site/src/solutions/outils-admin/sed-awk/data/`), énoncés et
  solutions neufs, exécutables dans le terminal ;
- reprend l'excellente idée des diapos SSH : réutiliser sed/awk sur des
  cas d'admin réels (`sshd_config`, sorties de commandes) — rappels
  inter-modules ;
- le lien vers le fork reste en « ressources supplémentaires »
  (pointer vers un dépôt public est licite ; le recopier ne l'est pas).

## 6. TP : améliorations de structure (remise en question demandée)

### TP Ansible — labo Docker générique + encarts Angers

⬥ Décision auteur : version générique sur le site, encarts pour les
étudiants d'Angers.

- **Labo** : un `docker compose` fournit `control-node` (Debian +
  ansible, ansible-lint, git, vim, tmux/tmuxp) et deux
  `managed-node-{1,2}` (Debian + sshd + python3), clés SSH injectées au
  build. Reproductible par tout lecteur, testable par le harnais et la
  CI `test-solutions.yml`.
- Le fil du TP est conservé tel quel (inventaire → variables → facts →
  lint/hooks git → **idempotence** → rôle `nginx_hello_world` →
  galaxy/collections → molecule → vault) : c'est sa force, chaque
  section est réutilisée par la suivante. Deux managed nodes (au lieu
  d'un) donnent du sens aux groupes d'inventaire dès le début.
- Les prérequis liés à l'infra (sshfs vers starwars, snapshot KVM,
  hostname imposé du LXC) deviennent des encarts
  `<Note title="Étudiants d'Angers">` aux étapes concernées ; la
  section tmux/tmuxp est conservée (fonctionne dans le conteneur) et
  s'appuie sur la section tmux du module SSH.
- Le projet final (cours/tutoriel molecule par groupe) est conservé
  comme travail à rendre — hors harnais, signalé comme tel.

### WireGuard — mini-labo Docker optionnel

⬥ Décision auteur. L'impossibilité déclarée (« une IP publique par
étudiant ») ne tient pas pour un labo local : deux conteneurs
(`cap_add: NET_ADMIN`) montent un tunnel `wg` sur le réseau compose et
se pinguent à travers le tunnel. Exercice avancé optionnel, corrigé
sous `solutions/`, testé en `--up` (ping via l'interface wg). Le module
passe de 100 % théorique à pratiquable.

### Bash — TP outillé

Les exercices existants (liste_fichiers, copie_fichiers) sont conservés
mais leurs corrigés deviennent des fichiers réels affichés par
`<CodeFile>` et testés par bats — y compris le `.bats` d'exemple du
cours, qui devient un vrai test exécuté en CI.

### Git — sorties régénérées

Le TP est rejoué par script (dépôt temporaire, dates fixées,
`GIT_AUTHOR_*` neutres) : les sorties `git log` montrées sont exactes
et cohérentes (cf. erreur n° 7 du § 7), et le harnais garantit qu'elles
le restent.

## 7. Liste critique — erreurs relevées dans les sources

Règle projet : signaler, proposer la correction, ne rien réécrire en
silence. **A = erreur franche** (corrigée à la conversion, sauf veto),
**B = à nuancer / moderniser** (proposition soumise).

### A. Erreurs franches

1. **Bash — `./fichier` n'est pas `source`** (partie 1, « Inclusion de
   fichiers ») : `./script` exécute dans un *sous-shell* ; l'équivalent
   de `source` est `. /chemin/fichier` (builtin « point »). Contresens
   à corriger impérativement.
2. **Bash — `return 0` en fin de script** (« Écriture d'un script
   Bash ») : hors fonction ou script *sourcé*, `return` échoue
   (« can only “return” from a function or sourced script ») → `exit 0`.
3. **awk — `'$2 < "30"'`** (« Filtres conditionnels ») : comparer à la
   *chaîne* `"30"` force une comparaison lexicale (`"9" < "30"` est
   faux !). L'exemple ne marche que par chance → `$2 < 30`.
4. **sed — encart « Choix du séparateur » corrompu** : « ex:
   /etc/ssh/sshdsed -n '2,10 p' data/sed/fruits.txt_config » — une
   commande s'est collée au milieu de `/etc/ssh/sshd_config`.
5. **cron — champ `login`** : le format à champ utilisateur ne vaut que
   pour `/etc/crontab` et `/etc/cron.d/*` ; un crontab utilisateur
   (`crontab -e`) n'a **pas** ce champ. À distinguer explicitement.
6. **LaTeX cassé (2 frames)** : « Commandes de base en mode commande »
   (Vim) et l'exercice GameShell contiennent des `\item` hors
   environnement de liste ; l'exercice `.vimrc` affiche des ```` ``` ````
   bruts. Le PDF distribué est probablement faux/tronqué à ces endroits
   — à vérifier de votre côté ; sans objet après conversion MDX.
7. **Git — sorties de correction incohérentes** : le commit de *revert*
   affiche le **même hash** que le commit reverté (impossible) ;
   `Author: login <login@laptop` sans `>` fermant. → sorties
   régénérées réellement (§ 6).
8. **TP Ansible** : `autorized_keys` / `autorisez_keys` →
   `authorized_keys` (recopiée, la coquille casse réellement l'accès
   SSH) ; la correction affiche `{{ welcome }}` alors que la variable
   déclarée est `welcome_msg` ; `msg: {{ ansible_hostname }}"`
   (guillemet ouvrant manquant — et un Jinja en début de valeur doit
   être quoté) ; `roles/…/default/main.yml` → `defaults/` (le `mkdir`
   au-dessus est correct, la suite non) ; `geerlinguy.docker` →
   `geerlingguy.docker` ; alias `ansible-playbooks` → la commande est
   `ansible-playbook` ; backticks parasites en fin de lignes d'alias.
9. **YAML — exemple final « déploiement d'infrastructure »** : le bloc
   est **invalide** (le contenu du scalaire `- |` doit être indenté
   plus que le tiret ; ici il est au même niveau) et `- c` devrait être
   `- -c`. Par ailleurs « Infrastructure As A Code (IAAS) » →
   **Infrastructure as Code (IaC)** — IaaS (Infrastructure as a
   Service) est un tout autre concept.
10. **Dépôt Markdown** : info-strings ```` ```mardown ```` (2×),
    « le formatage choisit » → « choisi » ; image distante Wikipedia →
    asset local (règle site). Les titres-décors
    `## ***__Cela donne:__***` deviennent un vrai gabarit
    « source / rendu » (composant, pas de l'emphase imbriquée).

### B. À nuancer / moderniser (propositions)

11. **SSH — `ssh-keygen -t rsa -b 4096`** → recommander **ed25519** par
    défaut (standard actuel, clés courtes, rapide) ; RSA 4096 en
    second choix pour serveurs anciens.
12. **« 80 % des serveurs sous Unix/Unix-like »** : invérifiable tel
    quel ; le chiffre solide est ~80 % des serveurs **web** (W3Techs).
    « 100 % des supercalculateurs » : exact (Top500, depuis nov. 2017)
    — sourcer les deux.
13. **Changer le port SSH** : réduit le *bruit* des scans de masse, pas
    les attaques ciblées ; contre-argument connu (port > 1024 =
    non privilégié). → Note « la sécurité par l'obscurité : ce qu'elle
    fait et ne fait pas ».
14. **YAML — booléens `yes/no/on/off`** : YAML 1.1 ; la spec 1.2 ne
    garde que `true/false`, et yamllint/ansible-lint (imposés par vos
    propres exercices) les signalent (règle *truthy*). Nuance à
    ajouter.
15. **`yq` : deux outils incompatibles portent ce nom.** Le cours
    documente le `yq` python (wrapper de jq, options `-y`/`-i`, celui
    d'`apt install yq` sur Debian) ; le plus répandu ailleurs est le
    `yq` Go de mikefarah (snap/brew), syntaxe différente. Sans une
    Note, la moitié des lecteurs aura des erreurs.
16. **Git** : enseigner `git restore` / `git switch` (≥ 2.23) à côté de
    `checkout` ; préférer l'idiome `git add` puis `git commit -m` à
    `git commit fichier -m`.
17. **Tableau YAML/JSON — « Déclaration de types : JSON Oui »** : JSON
    a des types *implicites par syntaxe*, pas de déclaration ; YAML a
    les tags `!!type`. Reformuler en « Types explicites ».
18. **`test -a` / `-o`** : marqués obsolescents par POSIX — cohérent
    avec votre recommandation `[[ ]]`, autant le dire.
19. **sed `2i\ texte`** : GNU sed accepte `2i texte` ; la forme `i\` +
    retour est le POSIX historique — clarifier pour éviter les erreurs
    de recopie.
20. **WireGuard** : « nécessite root » vaut pour tout VPN — le point
    distinctif est plutôt l'absence de DHCP/gestion d'identités ;
    coquilles « axaminé […] par des cryptographe ». Le mini-labo (§ 6)
    remplace « on ne le fera pas ».

Les coquilles simples (orthographe, accents, doublons d'espaces) sont
corrigées à la conversion sans être listées ici ; l'écriture inclusive
est conservée (cf. § 3.7).

## 8. Hors périmètre (assumé)

- Le dépôt `sed-awk-tutoriel` (contenu, données, `slideshow.html`) —
  droits (cf. § 5) ; non déposé dans `sources/`.
- Les vidéos Xavki (`ressources.md`) → simple lien en fin de module
  concepts Ansible.
- Le projet molecule « à rendre » reste un énoncé (pas de corrigé
  publié — c'est un travail noté).

## 9. Ordre de réalisation proposé

⬥ Plus de cours pilote imposé (décision auteur) ; jalons de relecture
conservés aux points structurants.

1. **Socle** : composant `<Duo>` + rétrofit `conteneurs-vs-vm` ;
   renumérotation des `order` Docker ; entrées `SERIES` ; extension du
   harnais (bats, yamllint, ansible-lint). → *jalon : valider le rendu
   Duo et le gabarit sur un module court.*
2. Modules courts : YAML & JSON, Markdown, Vim.
3. Bash ×2 (+ corrigés bats), sed & awk (exercices réécrits).
4. SSH (+ tmux), WireGuard (+ mini-labo).
5. Git (+ rejeu harnais).
6. Ansible : concepts + TP labo Docker (+ CI). → *jalon : relecture
   auteur du module concepts (contenu majoritairement IA).*
7. Traductions EN au fil de l'eau (chaque module part avec son EN,
   règle projet) ; `npm run build` sans warning et
   `test-solutions.sh --up` verts avant chaque étape conclue.

Le lot 2 (§ 10) s'enchaîne après le jalon Ansible.

## 10. Lot 2 — extensions validées (juillet 2026)

Quatre ajouts demandés par l'auteur après validation du plan initial ;
décisions ⬥ cadrées comme au § 2.

### 10.1 Série `decouverte` — « Découvrir l'ordinateur et le système »

⬥ Mini-série de 3-4 modules courts **en tête de parcours** (`order`
1-4), niveau volontairement plus accessible que le reste du site :

| # | Titre de travail | Contenu |
|---|---|---|
| 01 | De quoi est fait un ordinateur | CPU, mémoire, stockage, périphériques — figures `<Duo>` |
| 02 | Que fait un système d'exploitation | rôle de l'OS, processus, fichiers, droits, utilisateurices |
| 03 | Premiers pas dans le shell | terminal émulé du site en usage intensif |
| 04 | (optionnel) Du code source au programme | à cadrer selon le PDF |

- **Inspiration** : structure du cours d'introduction de Santini
  (Paris 13) — *inspiration de plan uniquement, aucune reprise de
  contenu* (droits tiers). PDF inaccessible depuis l'environnement :
  à téléverser pour cadrage fidèle, sinon cadrage sur le canon du
  genre (hardware → OS → shell).
- **Thématisation inclusive / désinvisibilisation** (demande auteur,
  dans l'esprit des exemples sed/awk existants — Ada Lovelace,
  autrices…) : les exemples, jeux de données et figures mettent en
  avant les contributions historiquement invisibilisées (Lovelace,
  Hopper, Hamilton, Johnson, Perlman, Conway…), sans en faire un
  cours d'histoire : le fil reste technique.
- **Provenance** : rédaction majoritairement IA sur cadrage auteur →
  `by: ai, reviewedBy: human` (relecture obligatoire avant
  publication), déclarée à la série.

### 10.2 Série `kvm` — « Virtualisation avec KVM »

⬥ Rédaction complète sur la trame de `sources/virtualisation/notes.md`
(+ inspiration playlist xavki, en lien). C'est le cours annoncé par
l'introduction du cours Outils. `order` 25-28 :

| # | Titre de travail | Contenu |
|---|---|---|
| 01 | La pile de virtualisation Linux | virsh → libvirt → QEMU → KVM, émulation vs accélération ; **renvoi** au module conteneurs-vs-VM (hyperviseurs déjà traités — pas de doublon) |
| 02 | TP : une première VM en CLI | virt-install, virsh, ISO + somme de contrôle, réseau `default` NAT |
| 03 | TP : définir et administrer | dumpxml, autostart, snapshots, seconde VM depuis XML |
| 04 | Réseau et stockage libvirt | à cadrer (bridges, pools) — peut rester « en construction » |

- Corrigés testables : la CLI KVM exige la virtualisation imbriquée —
  hors de portée de la CI GitHub. Le harnais couvrira ce qui est
  couvrable (`--lint` : shellcheck des scripts, validation XML) ; le
  reste est documenté comme non-CI (comme le projet molecule).
- **Provenance** : `by: mixed` (trame auteur, développement IA),
  relecture auteur au jalon.
- Erreurs des notes corrigées à la conversion (cf. § 7 A, n° 21-22).

### 10.3 Miscelánea — « les subtilités de bash »

⬥ Deux **articles de blog** (pas des modules de cours), avec renvois
croisés depuis les modules Bash de la série Outils :

1. « `local` n'est pas ce que vous croyez : la portée **dynamique**
   de Bash » — les scripts de `sources/subtilites_bash/` deviennent
   des démos exécutables (fichiers réels sous `solutions/`, rejoués
   par le harnais : la sortie montrée est la sortie réelle) :
   visibilité des locales dans les fonctions appelées, `local -r`,
   sous-shell vs nouveau processus (`$$` vs `BASHPID`), `export -f`
   + `nohup` et la perte de l'attribut readonly.
2. « Guillemets, expansions et sous-shells » — le mémo quoting
   **réécrit avec des exemples originaux** : la table source vient de
   StackOverflow (CC BY-SA 4.0, **incompatible** avec le BY-NC-SA du
   site — la clause SA interdit d'ajouter NC). Les règles sont des
   faits, l'expression sera neuve.
- Correction de fond à intégrer (cf. § 7 A n° 23) : dans un
  sous-shell, les variables ne sont pas « exportées implicitement » —
  elles sont héritées par le *fork* ; `export` ne concerne que
  l'environnement passé aux **nouveaux processus** (`exec`). C'est
  exactement ce que les scripts démontrent ; seule la terminologie
  des commentaires est à ajuster.
- **Provenance article** : `by: human, reviewedBy: ai` (fond auteur,
  mise en récit IA), déclarée par article (mécanisme existant pour
  les contenus hors série).

### 10.4 Cours Qt — en attente

L'archive n'est pas parvenue (seul le zip bash a été reçu). À
re-téléverser. Questions à trancher à réception : actualité du
contenu (Qt 5 → Qt 6), thématique (`divers` ou nouveau topic « dev » —
premier contenu hors admin sys/réseau du site), et place (série
autonome, `order` 40+). Rien n'est engagé d'ici là.

### 10.5 Ordre de réalisation du lot 2

1. Articles Miscelánea bash (courts, sources déjà complètes) ;
2. Série découverte (dès réception du PDF Santini — sinon cadrage
   autonome soumis à validation) ;
3. Série KVM ;
4. Qt à réception de l'archive.

## 11. Compléments à la liste critique (§ 7) — sources du lot 2

### A. Erreurs franches (suite)

21. **Virtualisation — « KVM est basé sur un fork du projet QEMU »** :
    c'est l'inverse. KVM est un module du noyau (Qumranet, 2007) ;
    c'est le *userspace* `qemu-kvm` qui était un fork de QEMU,
    refusionné dans QEMU upstream (≥ 1.3). La phrase « il faudrait
    plutôt parler de QEMU/KVM » reste, elle, correcte.
22. **Virtualisation — commandes** : `virsh undefined
    --remove-all-storage` → `virsh undefine` ; « virtual-manager »
    (2×) → `virt-manager` ; « libvirt permet d'autres types de
    virtualisations » : OpenVz → OpenVZ, et VMware s'écrit ainsi.
23. **Subtilités bash — terminologie sous-shell** : « les variables
    ont été EXPORTÉES IMPLICITEMENT » → héritage par fork (copie),
    l'`export` n'intervient que vers un nouveau processus. Le
    comportement décrit (readonly conservé en sous-shell, perdu via
    `export` + nouveau bash) est, lui, exact.

### B. À nuancer (suite)

24. **Virtualisation — type 1 / type 2** : garder la présentation de
    KVM en « cas particulier » de type 1, déjà arbitrée dans le
    module conteneurs-vs-VM — cohérence inter-cours.
25. **Virtualisation — chemin du réseau default** : « doit
    certainement se trouver dans /usr/share/libvirt/networks/ » — à
    vérifier et affirmer (c'est bien le gabarit ; la définition
    active vit dans `/etc/libvirt/qemu/networks/`).
