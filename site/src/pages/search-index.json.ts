import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import GithubSlugger from "github-slugger";

/** Index de la recherche Ctrl+K, GÉNÉRÉ AU BUILD depuis les collections —
    aucune duplication manuelle, aucun serveur. Schéma d'une entrée :
    { p: page, t: titre de section, page: url, hash?: ancre, b?: corps } */

/** Markdown/MDX → texte brut condensé (pour la recherche plein texte). */
function strip(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Même slugger que celui d'Astro pour les ids de titres → les ancres concordent.
// Chaque section h2 emporte son corps condensé (recherche plein texte).
function sectionsOf(body: string) {
  const slugger = new GithubSlugger();
  const out: { text: string; slug: string; body: string }[] = [];
  const parts = body.split(/^##\s+/m);
  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n");
    const text = (nl === -1 ? part : part.slice(0, nl)).replace(/[`*_]/g, "").trim();
    out.push({ text, slug: slugger.slug(text), body: strip(part).slice(0, 600) });
  }
  return out;
}

export const GET: APIRoute = async () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const index: { p: string; t: string; page: string; hash?: string; b?: string }[] = [];

  index.push(
    { p: "Accueil", t: "Accueil", page: `${base}/` },
    { p: "Cours", t: "Index des cours", page: `${base}/cours/` },
    { p: "Miscelánea", t: "Index des articles", page: `${base}/miscelanea/` },
    { p: "Aide", t: "Guide d'utilisation", page: `${base}/aide/` },
    { p: "Système", t: "Système de design", page: `${base}/systeme/` },
  );

  const cours = (await getCollection("cours", ({ data }) => !data.draft))
    .sort((a, b) => a.data.order - b.data.order);
  for (const c of cours) {
    const page = `${base}/cours/${c.id}/`;
    index.push({ p: c.data.title, t: c.data.title, page, b: c.data.description });
    for (const h of sectionsOf(c.body ?? "")) {
      index.push({ p: c.data.title, t: h.text, page, hash: h.slug, b: h.body });
    }
  }

  const articles = await getCollection("miscelanea", ({ data }) => !data.draft);
  for (const a of articles) {
    const page = `${base}/miscelanea/${a.id}/`;
    index.push({ p: a.data.title, t: a.data.title, page, b: a.data.description });
    for (const h of sectionsOf(a.body ?? "")) {
      index.push({ p: a.data.title, t: h.text, page, hash: h.slug, b: h.body });
    }
  }

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
