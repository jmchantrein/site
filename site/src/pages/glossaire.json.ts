import type { APIRoute } from "astro";
import { GLOSSAIRE } from "../data/glossaire.mjs";
import { wikiUrl, wikiImg } from "../data/glossaire-wiki.mjs";

/** Données de la popup du glossaire (gloss.js), GÉNÉRÉES AU BUILD depuis la
    source unique src/data/glossaire.mjs — chargées au premier survol.
    Schéma d'une entrée : { t: terme (langue de la page), x: terme dans
    l'autre langue, angl, type, bref, url: fiche }. */
export const GET: APIRoute = async () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const fr: Record<string, unknown> = {};
  const en: Record<string, unknown> = {};
  for (const e of GLOSSAIRE) {
    // Portrait Commons (miniature popup) — exception externe assumée, cf. glossaire-wiki.mjs.
    const img = e.type === "personnage" ? wikiImg(e.slug, 96) : undefined;
    fr[e.slug] = { t: e.fr, x: e.en, angl: !!e.angl, type: e.type, bref: e.brefFr, url: `${base}/glossaire/${e.slug}/`, wiki: wikiUrl(e.slug, "fr"), img };
    en[e.slug] = { t: e.en, x: e.fr, angl: !!e.angl, type: e.type, bref: e.brefEn, url: `${base}/en/glossaire/${e.slug}/`, wiki: wikiUrl(e.slug, "en"), img };
  }
  return new Response(JSON.stringify({ fr, en }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
