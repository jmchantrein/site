import type { APIRoute } from "astro";
import promptDoc from "../../../docs/prompt-redaction-mdx.md?raw";

/** Prompt de rédaction MDX SERVI EN STATIQUE depuis l'unique source
    (docs/prompt-redaction-mdx.md) — le bouton « Copier » du panneau Paramètres
    le récupère puis l'écrit dans le presse-papier. Aucune duplication.
    On ne sert que le prompt lui-même : le « mode d'emploi » destiné à l'humain,
    en tête du document, est retiré au marqueur COPY:START. */
const MARKER = "<!-- COPY:START -->";
const i = promptDoc.indexOf(MARKER);
const prompt = (i === -1 ? promptDoc : promptDoc.slice(i + MARKER.length)).trim() + "\n";

export const GET: APIRoute = () =>
  new Response(prompt, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
