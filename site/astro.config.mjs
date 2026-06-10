// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Tout est statique et local : polices (@fontsource), icônes (lucide-static)
// et maths (KaTeX) sont résolus au build — aucun CDN au runtime.
export default defineConfig({
  integrations: [mdx()],
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
