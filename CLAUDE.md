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
- **KISS / DRY** : préférer la simplicité ; un composant se définit une fois
  (`site/src/components/` + `site/src/styles/components.css`), les pages ne
  font qu'instancier.
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

## Vérification

```bash
cd site
npm install        # une fois
npm run build      # doit passer sans erreur ni warning avant de conclure
npm run dev        # aperçu local
```

Vérifier sur la page rendue : maths KaTeX, composants câblés (exercice
verrouillé, terminal, diaporama), aucune ressource réseau externe.
