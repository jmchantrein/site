# Sources — formation Docker

Provenance : https://github.com/jmchantrein/formation_docker
(commit `69194e86fc1012662ff49fa1b9adef8d3083b781`, 4 décembre 2024)
et archive LaTeX `Cours_docker.zip` fournie par l'auteur (juin 2026).
Licence : CC BY-NC-SA (`LICENSE.md` ; la présentation indique CC BY-NC-SA 3.0).

| Fichier | Nature | Statut |
|---|---|---|
| `travaux_pratiques.md` | TP « Conteneurisation d'un service WordPress » (Markdown Pandoc, nov. 2017) | Converti → `site/src/content/cours/tp-docker-wordpress.mdx` |
| `presentation.pdf` | Cours « Fondements de la technologie de conteneurisation docker » (Beamer, 73 diapos, nov. 2018) | Rendu de référence du `.tex` ci-dessous |
| `latex/presentation.tex` | Source Beamer de la présentation | Converti → 3 pages : `conteneurs-vs-vm.mdx`, `docker-bases.mdx`, `docker-images.mdx` (contenu actualisé au fil de l'eau, validé par l'auteur) |
| `latex/src/` | Dockerfiles d'exemple (sshd, simple, vnc) | Intégrés en blocs de code (à la place des captures bitmap) |
| `latex/output/` | Sorties de terminal réelles (`verbatiminput`) | Intégrées en transcriptions `console` et `<Cmd>`/`<TermLine>` |
| `latex/img/` | Schémas de référence (hyperviseur, conteneur, carte d'identité, Dockerfile sshd) | Recréés en composants natifs (`ArchiStack`, `LayerStack`, `BuildStack`) |

Non archivé ici : les séquences PNG `image_vs_conteneur_01..14` et
`build_sshd_01..16` (~65 Mo d'exports non compressés, disponibles dans
l'archive zip d'origine) — remplacées par les composants `LayerStack` et
`BuildStack` dans des diaporamas `<Slides>`.
