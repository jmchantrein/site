# Site Astro — cadre pédagogique

Site pédagogique statique : cours techniques structurés + blog scientifique
(Miscelánea). Design fondé sur les sciences cognitives de l'apprentissage
(Sweller, Mayer), conforme WCAG AA (corps AAA). **Tout est statique et
local** : polices, icônes et maths sont résolus au build — aucun CDN.

```bash
npm install     # une fois
npm run dev     # développement (http://localhost:4321)
npm run build   # production → dist/ (servi sous /site/ — GitHub Pages)
```

## Architecture en couches (séparation stricte contenu / forme)

| Couche | Où | Rôle |
|---|---|---|
| 1 · Tokens | `src/styles/tokens.css` | Couleurs (ratios WCAG annotés), typo, espacement, largeurs. Modifier ici → tout le site suit. |
| 1bis · Thèmes | `src/styles/themes.css` | 5 thèmes qui ne redéfinissent **que** les tokens couleur (Abysse sombre par défaut). |
| 2 · Composants | `src/components/`, `src/styles/components.css` | Composants contraints qui encodent les principes (le bon usage est automatique). |
| 3 · Gabarits | `src/layouts/` | Chrome (en-tête, tiroirs, pied) et mise en page de lecture. |
| 4 · Contenu | `src/content/` | **MDX pur** : frontmatter + composants. Jamais de HTML/CSS à la main. |

Le runtime partagé (`src/scripts/site.js`) câble : tiroirs Accessibilité /
Paramètres (persistants), langue FR/EN, terminal interactif, verrou des
exercices, sommaires, ancres, recherche Ctrl+K, diaporamas.

## Écrire un cours (MDX)

Créer `src/content/cours/mon-cours.mdx` :

```mdx
---
title: "Titre du cours"
description: "Une phrase de chapeau."
order: 3                  # position dans le parcours
topics: [linux]           # linux | reseau | sciences | divers (src/data/topics.ts)
duration: 12              # minutes (facultatif)
badge: "Fondations"       # pastille (facultatif)
tags: [mot-clé]           # carte d'index (facultatif)
terminal: true            # affiche l'atelier terminal à droite
terminalTitle: "bash — atelier"
---

## Une section

Du texte avec des maths : $E = mc^2$, ou en bloc :

$$
\frac{w_i}{\sum_j w_j}
$$
```

Les composants sont disponibles **sans import** (liste blanche dans
`src/components/mdx.ts`) :

- `<Note type="info|success|warning|danger" title="…">` — admonition (signalement) ;
- `<Exercise id="unique" level={1|2|3}>` énoncé + `<Fragment slot="solution">` — solution repliable, verrouillée tant que le champ réponse est vide (effet de test) ;
- `<Cmd cmd="…">` + `<TermLine type="out|ok|warn" tag="…">` — commande cliquable exécutée dans le terminal ;
- `<Slides title="…">` + `<Slide>` (ou `<Slide media>` pour un PDF/iframe) — diaporama ;
- `<Bypass title="…">` — gabarit d'îlot applicatif : une appli JS pédagogique dans un cadre standard (étiquette, titre, plein écran) ;
- `<Escape>` — trappe d'évasion : la seule zone où le contenu libre (HTML/JS, îlot custom) est attendu ;
- `<IpSim />`, `<BootBench />` — îlots interactifs existants.

**Traduction anglaise (règle projet)** : chaque contenu FR a son pendant EN
dans le sous-dossier `en/` de sa collection (`src/content/cours/en/…`),
servi sous `/en/…` — l'en-tête propose la bascule quand la traduction
existe. À chaque modification d'un contenu FR, mettre à jour la version EN.

Un article se crée de la même façon dans `src/content/miscelanea/`
(frontmatter : `title`, `description`, `topics` — multi-thématiques possibles —,
`duration`). Les index Cours/Miscelánea, les cartes, la navigation
précédent/suivant et l'index de recherche sont **générés** depuis ces fichiers.

## Migration des cours (dossier `sources/`)

Les sources (LaTeX / Markdown fiables ; PDF en dernier recours) sont déposées
dans `../sources/` puis converties en MDX : maths → `$…$`, environnements
LaTeX (théorème, exercice, remarque) → composants ci-dessus. Procédure : un
cours pilote d'abord, validation, puis le reste.

## Ajouter une icône / un îlot

- Icône : ajouter l'entrée dans la carte de `src/components/Icon.astro`
  (lucide-static, inlinée au build).
- Îlot : créer `src/components/MonIlot.astro` (markup + `<style>` scopé +
  `<script>`), l'enregistrer dans `src/components/mdx.ts`.
