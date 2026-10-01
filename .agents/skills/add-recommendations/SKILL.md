---
name: add-recommendations
description: Add one or more external resources to IAdmin's bilingual “À explorer…” catalogue. Use when the author asks to add, import, recommend, catalogue, or enrich channels, playlists, videos, films, books, articles, or serious games, including mixed batches and partial references.
---

# Add recommendations

## Workflow

1. Read `AGENTS.md` and `references/schema.md`.
2. Treat **“add” as authorization to write immediately**. Do not request approval before creating the minimum publishable entries.
3. Identify each resource from the supplied URLs, titles, or notes. Browse authoritative current sources to verify mutable facts. Never guess an ambiguous work.
4. Search `site/src/content/ressources/` for URL, YouTube-ID, title, and slug duplicates.
5. Model every recommended channel, playlist, video, film, book, article, or serious game as a separate entry. Declare a factual relation once; pages generate inverse relations.
6. Create matching FR and EN MDX files. Translate editorial prose and labels, but preserve URLs, identifiers, slugs, titles that should remain original, and structural metadata.
7. Write a short neutral `summary` only when sources are sufficient. Paraphrase; do not copy promotional descriptions. Omit it rather than speculate.
8. Never invent the author's opinion. Add MDX body prose under “Why I recommend it” only from the author's own guidance.
9. Use existing topics conservatively. If a new topic or kind would help, publish with an honest existing classification when possible, then propose the new bilingual registry value after the write. Never add a registry value silently.
10. Add bilingual glossary entries for every real person newly named in public content.
11. Set `editorialStatus: minimal` unless the author reviewed or supplied the editorial treatment. This status is private and never blocks publication.
12. Run `cd site && npm run check`. Fix failures caused by the change.
13. Report what was published, verification sources, classification choices, and optional enrichments. Do not present enrichment as required work.

## Batch rules

- Preserve one entry per resource and connect them with `channel`, `playlists`, and `related`.
- Do not import every item from a channel or playlist: add only the requested recommendations.
- Deduplicate shared parents across the batch.
- A resource may have multiple topics but one primary kind.
- Keep external availability links optional and typed. Do not claim current streaming, translation, dubbing, or subtitle availability without verification.
- Use `VideoEmbed` data (`youtubeId` or `playlistId`) for YouTube; never add a plain YouTube link as the viewing mechanism.

## Follow-up requests

- “Show minimal recommendations”: list entries with `editorialStatus: minimal`.
- “Enrich”: update only the selected entries from the author's answers.
- “Reviewed”: set `editorialStatus: reviewed`; length is irrelevant.
- “Remove a topic”: update both locales and re-run checks.
