# Catalogue schema

## Paths

- FR: `site/src/content/ressources/<slug>.mdx`
- EN: `site/src/content/ressources/en/<slug>.mdx`
- FR route: `/explorer/<slug>/`
- EN route: `/en/explorer/<slug>/`

## Minimal entry

```yaml
---
title: "Original or localized title"
kind: video
added: YYYY-MM-DD
languages: [fr]
topics: [technique]
editorialStatus: minimal
youtubeId: "abcdefghijk"
draft: false
---
```

The body is optional. An empty body is intentionally publishable and must not contain placeholder prose.

## Kinds

`channel`, `playlist`, `video`, `film`, `book`, `article`, `serious-game`.

Propose a new bilingual kind to the author when none fits; do not silently add one.

## Topics

Read IDs and bilingual labels from `site/src/data/topics.ts`. Use two to four precise values in most cases. A resource may have several topics. Propose a new bilingual topic to the author when necessary; do not silently add one.

## Optional fields

```yaml
summary: "Neutral factual presentation."
year: 2024
duration: 24
subtitles: [fr, en]
translations: [fr]
channel: parent-channel-slug
playlists: [parent-playlist-slug]
related: [another-resource-slug]
playlistId: "PL..."
links:
  - role: official
    label: "Official website"
    url: "https://example.org"
image:
  src: "images/recommendations/example.jpg"
  alt: "Accessible description"
# Or a verified free image displayed from Wikimedia Commons:
wikiImage:
  file: "Example.jpg"
  alt: "Accessible description"
```

Link roles: `official`, `publisher`, `library`, `reference`, `watch`, `read`, `play`.

Use exactly one of `youtubeId` and `playlistId`. YouTube video IDs have 11 URL-safe characters.
Use at most one of `image` and `wikiImage`. Images are optional; never fetch commercial covers or thumbnails automatically.

## Structural parity

Keep these fields identical across FR and EN unless their values are prose labels: `kind`, `added`, `year`, `duration`, `languages`, `subtitles`, `translations`, `topics`, `editorialStatus`, `youtubeId`, `playlistId`, `channel`, `playlists`, `related`, `draft`, link URLs and roles.

Translate `summary`, link labels, and author-supplied MDX prose. Preserve stable slugs and identifiers.
