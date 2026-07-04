# Site Astro — cadre pédagogique (consignes projet)

Site pédagogique **statique** : cours techniques (style manuel) + blog
scientifique « Miscelánea ». Astro + MDX. Design issu d'un prototype Claude
Design (`project/` ; justification des choix dans
`docs/design-rationale.md`) fondé sur les sciences cognitives (Sweller,
Mayer), WCAG AA (corps AAA).

## Règles non négociables

- **Séparation stricte contenu / forme** : le contenu vit dans
  `site/src/content/` en **MDX pur** (frontmatter + composants).
  **Jamais de HTML/CSS à la main dans les fichiers de contenu** — toute mise
  en forme passe par les composants ou les tokens. Seule exception : le
  composant `<Escape>` (trappe d'évasion), prévu pour le contenu libre.
- **Tout statique et local** : aucun CDN, aucune ressource externe au runtime
  (polices via @fontsource, icônes lucide-static inlinées, KaTeX au build).
  **Exception assumée** (décision auteur, juillet 2026) : les **images
  issues de Wikimedia Commons** — portraits du glossaire et illustrations
  de cours via `<WikiImage>` (images libres, attribution liée vers la page
  Commons) — sont affichées depuis Commons (pas d'images à héberger ni de
  licences à gérer dans le dépôt), avec repli silencieux `onerror`. C'est
  la seule ressource externe autorisée.
- **KISS / DRY** : préférer la simplicité ; un composant se définit une fois
  (`site/src/components/` + `site/src/styles/components.css`), les pages ne
  font qu'instancier.
- **Corrigés testables** : un corrigé de code (Dockerfile, compose, script…)
  n'est jamais écrit en dur dans le MDX. Il vit comme fichier réel sous
  `site/src/solutions/`, est affiché par `<CodeFile>` et couvert par le
  harnais de test — voir « Corrigés testables (mécanisme imposé) ».
- Si une décision d'architecture a plusieurs options, **proposer les options
  à l'auteur** plutôt que de trancher seul.
- Maths : `$…$` en ligne, `$$` **sur leurs propres lignes** pour le mode
  display (sinon micromark les traite en ligne).
- **Traduction anglaise systématique** : tout contenu français (cours,
  articles) a sa traduction anglaise dans le sous-dossier `en/` de sa
  collection (`site/src/content/cours/en/`, `…/miscelanea/en/`), servie
  sous les routes `/en/…`. **À chaque création ou modification d'un contenu
  français, c'est à l'agent de créer/mettre à jour la version anglaise**
  dans le même lot de travail — jamais de contenu FR sans son pendant EN.
  On traduit la prose, les titres et le frontmatter (title, description) ;
  on ne traduit pas les commandes, les sorties de terminal capturées, ni
  les identifiants (`id` d'exercice, slugs des autres pages).
- **Portabilité des données locales** : tout ce qui est persisté côté
  lecteur (`localStorage` : préférences, réponses d'exercices, annotations,
  identité…) doit pouvoir être **exporté et réimporté** (fichier JSON).
  Toute nouvelle persistance locale doit être couverte par l'export global
  du panneau Paramètres (ou fournir son propre export/import, comme les
  annotations).
- **Illustrations systématiques** : pour **tout cours** (existant ou à
  venir), proposer des illustrations dès qu'elles servent la
  compréhension — figures thémables (`ArchiStack`, `MachineMap`…),
  **vues éclatées et animations en JS** (îlots, cf. `MachineExplode`),
  images libres via `<WikiImage>`. **La qualité prime sur la source** :
  une image Wikimedia n'est retenue que si elle est à jour, lisible et
  correctement légendée (vérifier chaque référence de légende) — sinon,
  préférer une figure thémable ou un îlot animé. Une figure en regard
  du texte qu'elle illustre passe par `<Duo>`. C'est une proposition à
  faire par défaut, pas une option.
- **Glossaire systématique** : les termes techniques, anglicismes
  (correspondance FR ↔ EN) et personnages des sciences vivent dans la
  source unique `site/src/data/glossaire.mjs` ; l'auto-liaison au build
  (première occurrence par page, popup au survol, fiche `/glossaire/`)
  maille les cours sans intervention. **Tout nouveau contenu qui introduit
  une notion ajoute son entrée au glossaire dans le même lot** (bref FR +
  EN) ; les faux positifs se traitent avec `<G off>`, les reformulations
  avec `<G t="slug">`.

## Structure

- `site/` — le site Astro (voir `site/README.md` : architecture en couches,
  gabarit de cours, liste des composants MDX).
- `sources/` — cours sources fournis par lots (LaTeX et Markdown fiables ;
  PDF en dernier recours, extraction bruitée).
- `project/` — prototype Claude Design (référence visuelle ; ne pas
  modifier).
- `docs/design-rationale.md` — le « pourquoi » du design : principes
  cognitifs/WCAG et décisions prises en session de conception.

## Migration des cours (workflow imposé)

1. **Un cours pilote d'abord** (désigné par l'auteur) : conversion en MDX
   dans `site/src/content/cours/`, montrer le résultat, attendre le feu vert
   avant de traiter le reste du lot.
2. Mapper les environnements LaTeX : théorème/définition/remarque → `<Note>`,
   exercice (énoncé + correction) → `<Exercise>` (solution dans
   `<Fragment slot="solution">`), figures interactives → îlot dédié ou
   `<Escape>`.
3. **Être critique sur le contenu** : signaler erreurs, passages datés,
   imprécisions et manques dans une liste séparée — proposer les corrections,
   ne pas réécrire silencieusement.
4. Source PDF ambiguë (maths cassées, structure incertaine) : **signaler
   explicitement au lieu de deviner**.

## Corrigés testables (mécanisme imposé)

Tout corrigé de code doit être **exécutable et testé**, jamais seulement
recopié dans le MDX. Ce mécanisme, mis en place sur le TP Docker WordPress,
est à **reproduire pour tout futur cours comportant des corrigés exécutables** :

1. **Source unique.** Le corrigé vit comme fichier réel sous
   `site/src/solutions/<cours>/…` (arborescence reflétant les étapes), et le
   cours l'affiche avec `<CodeFile path="…" lang="…" />`. Le code montré au
   lecteur **est** le code testé : aucune duplication MDX ↔ fichier. Le
   composant charge le fichier au build et reproduit le markup terminal du
   site (pas de coloration Shiki).
2. **Harnais de test.** `site/scripts/test-solutions.sh`
   (`--lint` / `--build` / `--up`) construit, et en `--up` démarre puis teste
   (HTTP, sortie attendue…) chaque corrigé, avant nettoyage. Un nouveau cours
   ajoute ses cas dans ce script (ou un script frère bâti sur le même modèle).
3. **CI dédiée.** `.github/workflows/test-solutions.yml` rejoue le harnais à
   la demande et à chaque changement de `site/src/solutions/**`. Il est
   **séparé** du déploiement Pages : il lui faut Docker, inutile au build du
   site.

Les fichiers de corrigés ont des **commentaires en anglais** (fichier unique
partagé FR/EN) ; la pédagogie traduite reste dans la prose MDX.

## Vérification

```bash
cd site
npm install        # une fois
npm run build      # doit passer sans erreur ni warning avant de conclure
npm run dev        # aperçu local
```

Vérifier sur la page rendue : maths KaTeX, composants câblés (exercice
verrouillé, terminal, diaporama), aucune ressource réseau externe.

Corrigés exécutables : les tester avec le harnais (Docker requis) —

```bash
cd site
scripts/test-solutions.sh --up    # build + run + test HTTP, puis nettoyage
```
