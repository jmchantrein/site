// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Tout est statique et local : polices (@fontsource), icônes (lucide-static)
// et maths (KaTeX) sont résolus au build — aucun CDN au runtime.
export default defineConfig({
  // Adresse publique (GitHub Pages) — sert au sitemap, au flux RSS et aux
  // chemins absolus. `astro preview` sert le site sous /site/ en local.
  site: "https://jmchantrein.github.io",
  base: "/site",
  integrations: [
    mdx(),
    // i18n : annote le sitemap d'alternates hreflang FR ↔ EN (les pages EN
    // vivent sous /en/, le français est la langue par défaut).
    sitemap({
      i18n: { defaultLocale: "fr", locales: { fr: "fr", en: "en" } },
    }),
  ],
  markdown: {
    processor: unified({
      // Les maths s'écrivent $…$ / $$…$$ dans le MDX et sont rendues au build.
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: false }]],
    }),
    // Pas de coloration syntaxique inline : les blocs de code suivent les
    // tokens du terminal (--term-*), donc le thème du site (cf. base.css).
    syntaxHighlight: false,
  },
});
