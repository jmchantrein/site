/**
 * REHYPE-GLOSSAIRE — l'auto-liaison des termes du glossaire, au build.
 *
 * Le maillage est SYSTÉMATIQUE par construction : la liste prédéfinie
 * (src/data/glossaire.mjs) est reconnue dans la prose de tous les contenus
 * MDX (cours, miscelánea) et chaque terme devient un lien vers sa fiche,
 * décoré par la popup de survol (src/scripts/gloss.js).
 *
 * Règles (convention Wikipédia) :
 *   - PREMIÈRE occurrence par page seulement (sinon, bruit visuel) ;
 *   - jamais dans : titres, liens existants, code (inline et blocs),
 *     formules KaTeX, ni dans les composants Cmd / TermLine / CodeFile /
 *     Escape / G (le composant <G> sert justement de surcharge manuelle :
 *     <G off>…</G> inhibe, <G t="slug">…</G> force) ;
 *   - pages FR : formes françaises + formes anglaises des anglicismes
 *     (`angl: true`) ; pages EN : formes anglaises ;
 *   - pluriels simples en -s reconnus automatiquement ;
 *   - GATING D'HOMONYMIE : une entrée portant `only: [séries]` n'est
 *     auto-liée que dans les modules de ces séries (frontmatter `serie`) —
 *     « image » ne pointe vers l'image Docker que dans la série docker ;
 *   - la collection glossaire elle-même n'est pas auto-liée (une fiche
 *     peut lier à la main, en Markdown).
 */
import { GLOSSAIRE } from "../data/glossaire.mjs";

const EXCLUDED_TAGS = new Set(["a", "code", "pre", "script", "style", "h1", "h2", "h3", "h4", "h5", "h6"]);
const EXCLUDED_JSX = new Set(["Cmd", "TermLine", "CodeFile", "Escape", "G", "Terminal"]);

/** Échappe une forme pour l'injecter dans une alternation regex. */
function escapeForm(f) {
  return f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s\\u00A0]+");
}

/** Pluriel simple : « conteneur » reconnaît aussi « conteneurs ». */
function withPlural(f) {
  return /[sxz]$/i.test(f) ? escapeForm(f) : `${escapeForm(f)}s?`;
}

/** Matchers par locale, construits une fois (module-level). */
const matchers = {};
function matcherFor(locale) {
  if (matchers[locale]) return matchers[locale];
  /** @type {{form: string, slug: string}[]} */
  const forms = [];
  for (const e of GLOSSAIRE) {
    const list =
      locale === "en"
        ? [e.en, ...(e.aliasEn ?? [])]
        : [e.fr, ...(e.aliasFr ?? []), ...(e.angl ? [e.en, ...(e.aliasEn ?? [])] : [])];
    for (const f of list) forms.push({ form: f, slug: e.slug });
  }
  // Le plus long d'abord : « registre d'images » gagne sur « registre ».
  forms.sort((a, b) => b.form.length - a.form.length);
  const seen = new Set();
  const parts = [];
  const bySimple = new Map(); // forme normalisée (minuscule, sans pluriel) → slug
  for (const { form, slug } of forms) {
    const key = form.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(withPlural(form));
    bySimple.set(key, slug);
    if (!/[sxz]$/i.test(key)) bySimple.set(`${key}s`, slug);
  }
  const onlyBySlug = new Map(GLOSSAIRE.filter((e) => e.only).map((e) => [e.slug, e.only]));
  // Frontières : pas de lettre/chiffre/trait d'union accolé (accents inclus).
  const re = new RegExp(`(?<![\\p{L}\\p{N}-])(?:${parts.join("|")})(?![\\p{L}\\p{N}-])`, "giu");
  matchers[locale] = { re, bySimple, onlyBySlug };
  return matchers[locale];
}

function isExcludedElement(node) {
  if (node.type === "element") {
    if (EXCLUDED_TAGS.has(node.tagName)) return true;
    const cls = String(node.properties?.className ?? "");
    if (cls.includes("katex") || cls.includes("math")) return true;
    return false;
  }
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    return EXCLUDED_JSX.has(node.name ?? "");
  }
  return false;
}

/**
 * @param {{ base?: string }} options — préfixe du site (ex. « /site »).
 */
export default function rehypeGlossaire(options = {}) {
  const base = (options.base ?? "").replace(/\/$/, "");

  return function transformer(tree, file) {
    const path = String(file?.path ?? "");
    // Seulement les contenus des collections cours et miscelánea.
    if (!/[\\/]content[\\/](cours|miscelanea)[\\/]/.test(path)) return;
    const locale = /[\\/](cours|miscelanea)[\\/]en[\\/]/.test(path) ? "en" : "fr";
    const { re, bySimple, onlyBySlug } = matcherFor(locale);
    const prefix = locale === "en" ? `${base}/en/glossaire/` : `${base}/glossaire/`;
    const used = new Set(); // première occurrence par page
    // Gating d'homonymie : la série du module courant (frontmatter Astro).
    const serie = file?.data?.astro?.frontmatter?.serie;

    function linkify(value) {
      const out = [];
      let last = 0;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(value)) !== null) {
        const slug = bySimple.get(m[0].toLowerCase().replace(/[\s ]+/g, " "));
        if (!slug || used.has(slug)) continue;
        const only = onlyBySlug.get(slug);
        if (only && !only.includes(serie)) continue;
        used.add(slug);
        if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
        out.push({
          type: "element",
          tagName: "a",
          properties: { href: `${prefix}${slug}/`, className: ["gloss"], "data-gloss": slug },
          children: [{ type: "text", value: m[0] }],
        });
        last = m.index + m[0].length;
      }
      if (out.length === 0) return null;
      if (last < value.length) out.push({ type: "text", value: value.slice(last) });
      return out;
    }

    function walk(node) {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "text") {
          const repl = linkify(child.value);
          if (repl) {
            node.children.splice(i, 1, ...repl);
            i += repl.length - 1;
          }
        } else if (!isExcludedElement(child)) {
          walk(child);
        }
      }
    }

    walk(tree);
  };
}
