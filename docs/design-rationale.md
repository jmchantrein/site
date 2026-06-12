# Pourquoi ce design — rationale des sessions Claude Design

Document extrait des transcripts de conception (Claude Design, juin 2026).
Il consigne la *justification* des choix de design ; les règles
opérationnelles vivent dans `CLAUDE.md`, les tokens chiffrés et le rendu
des composants dans `project/design-system.html` et le code, la liste des
composants MDX dans `site/README.md`.

## Fondement : réduire la charge cognitive extrinsèque

Le site est conçu d'après la théorie de la charge cognitive (Sweller) et
l'apprentissage multimédia (Mayer), avec conformité WCAG AA partout et AAA
visée sur le corps de texte. Aucune décoration gratuite, sobriété
éditoriale, pas d'esthétique « SaaS ». Chaque décision de design doit
pouvoir citer le principe cognitif ou la règle WCAG qu'elle sert.

## Contraintes de lisibilité (encodées comme contraintes, pas comme suggestions)

- Colonne de lecture : **66 caractères/ligne par défaut** (`--measure`),
  **réglable par le lecteur** (56–96 ch, panneau Paramètres), comme la
  largeur globale du site (60–160 rem, défaut 84). Décision révisée
  (juin 2026) : la mesure typographique idéale est un défaut, pas un
  carcan — l'écran large est exploité par les colonnes périphériques
  (sommaire, terminal, rail de notes) et par le contrôle donné au lecteur,
  pas en étirant la ligne de texte au-delà du confortable.
- Corps ≥ **18 px**, interligne 1,5–1,6, sans-serif à forte hauteur d'x.
- Hiérarchie typographique nette (principe de signalement de Mayer) ;
  mise en évidence sobre des termes-clés.
- Sections courtes, fort espacement entre blocs (principe de
  segmentation), blanc tournant fonctionnel.
- Contraste : corps **AAA (7:1)** si possible, **AA (4,5:1)** minimum
  partout. Terminal sombre : blanc cassé (~`#e0e0e0`) sur quasi-noir
  (~`#1a1a1a`), **jamais** blanc pur sur noir pur. L'information n'est
  jamais portée par la couleur seule (toujours icône ou label en plus).
- Trois familles : **Source Serif 4** pour les titres
  (signalement/hiérarchie), **Public Sans** pour le corps (forte hauteur
  d'x), **IBM Plex Mono** pour code/terminal.

## Panneau d'accessibilité (WCAG 1.4.12)

Accessible depuis toute page, sans perte de contenu ni de fonction :
taille du texte ; interligne et espacements lettres/mots (jusqu'aux
seuils 1,5× / 0,12× / 0,16×) ; contraste élevé ; réduction des animations
(fige le terminal animé, respecte `prefers-reduced-motion`) ; police de
lecture alternative **Atkinson Hyperlegible / OpenDyslexic** — proposée,
jamais imposée. Toutes les préférences persistent (`localStorage`).

## Le design comme cadre pédagogique (architecture en couches)

Écrire un cours doit respecter automatiquement les recommandations :

1. **Tokens globaux** (couleurs avec ratios de contraste annotés,
   échelles typo/espacement, largeurs) — modifiables en un seul endroit.
2. **Composants contraints** qui encodent les principes :
   note/admonition (signalement), exercice à structure imposée
   énoncé → solution repliable (*testing effect* — la solution est
   verrouillée tant que l'apprenant n'a pas tenté une réponse), commande
   cliquable, panneau terminal sombre. Le composant rend le bon usage
   automatique.
3. **Modulation ponctuelle** : variantes documentées par composant,
   ajustement d'une page isolée sans casser la cohérence.
4. **Trappe d'évasion** : un bloc « pleine liberté » où le cadre se
   désactive pour du contenu arbitraire (HTML/JS/visualisation custom).

## Décisions prises en session (avec leur justification)

- **Tonalité froide** (gris-bleu), accent bleu encre ; thèmes : Marine,
  Ardoise, Forêt, Aurore, Abysse (sombre) — la métaphore marine/profondeur
  structure l'identité ; le sombre passe par un token `--color-on-accent`
  pour tenir les contrastes. **Défaut révisé (juin 2026)** : le thème suit
  la préférence système (`prefers-color-scheme`) — Marine en clair, Abysse
  en sombre. La lecture longue se fait mieux en polarité positive ; le
  sombre par défaut était un choix d'identité, pas de lisibilité.
- **Maths : KaTeX** (rendu LaTeX réel, requis pour un blog scientifique).
- **Bilingue**, français par défaut.
- **Terminal pédagogique** : démo « live » — commandes cliquables à
  sortie simulée animée, saisie directe avec historique, bascule
  clair/sombre **locale** au terminal (persistante), déplaçable et
  redimensionnable (splitter lecture/terminal + réglage de largeur
  globale du site).
- **Icônes Lucide** (cohérence, finesse) ; boutons d'en-tête en icône
  seule avec libellé au survol — œil = accessibilité, roue crantée =
  paramètres, deux panneaux distincts (fonctionnalité lecteur ≠
  exploration design).
- **« Miscelánea »** : nom retenu pour la partie blog multi-thématiques
  (avec nuage de tags et bascule par thématique / par article).
- **Annotations de l'apprenant** (implémentées — `annotate.js`) :
  surlignage 4 couleurs + notes post-it en rail latéral, persistance
  `localStorage` par page, ancrage par citation + offset (modèle W3C Web
  Annotation, robuste au rechargement), export/import JSON, identité
  locale, backend enfichable — pour que l'étudiant arrive en TP avec ses
  questions déjà formulées (apprentissage actif).
- **Sommaire latéral généré** (h2) sur cours et articles, avec scrollspy
  et double mobile ; **recherche plein texte** Ctrl+K ou « / » (index
  construit au build, corps de texte inclus).
- **Impression** : feuille `@media print` (papier blanc quel que soit le
  thème, chrome masqué, URL des liens imprimées, solutions dépliées).
- **Abandonné** : l'effet de « plongée » au scroll (tokens retirés —
  décoration sans bénéfice pédagogique démontré).

- **Dock & passe-temps cadencés** (juin 2026) : l'en-tête porte un dock
  d'applications (terminal multi-modes, Pomodoro, jeux — Snake, 2048, vie
  de Conway 2D/3D). Les jeux sont des *digressions volontaires* — la
  tension avec « aucune distraction » est arbitrée par le **Pomodoro** :
  25 min de lecture active déverrouillent 5 min de passe-temps (alternance
  mode focalisé / mode diffus), icônes grisées le reste du temps, aucun
  signal d'appel.
