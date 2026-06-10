import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import GithubSlugger from "github-slugger";

/** Index de la recherche Ctrl+K, GÉNÉRÉ AU BUILD depuis les collections —
    aucune duplication manuelle, aucun serveur. Schéma d'une entrée :
    { p: page, t: titre de section, page: url, hash?: ancre } */

// Même slugger que celui d'Astro pour les ids de titres → les ancres concordent.
function headingsOf(body: string) {
  const slugger = new GithubSlugger();
  const out: { text: string; slug: string }[] = [];
  for (const m of body.matchAll(/^##\s+(.+)$/gm)) {
    const text = m[1].replace(/[`*_]/g, "").trim();
    out.push({ text, slug: slugger.slug(text) });
  }
  return out;
}

export const GET: APIRoute = async () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const index: { p: string; t: string; page: string; hash?: string }[] = [];

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
    index.push({ p: c.data.title, t: c.data.title, page });
    for (const h of headingsOf(c.body ?? "")) {
      index.push({ p: c.data.title, t: h.text, page, hash: h.slug });
    }
  }

  const articles = await getCollection("miscelanea", ({ data }) => !data.draft);
  for (const a of articles) {
    const page = `${base}/miscelanea/${a.id}/`;
    index.push({ p: a.data.title, t: a.data.title, page });
    for (const h of headingsOf(a.body ?? "")) {
      index.push({ p: a.data.title, t: h.text, page, hash: h.slug });
    }
  }

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
