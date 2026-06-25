import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TOPIC_IDS } from "./data/topics";
import { SERIE_IDS } from "./data/series";
import { PROV_BY, PROV_REVIEW } from "./data/provenance";
import { STATUS_VALUES } from "./data/status";

/* Le contenu vit dans src/content/ en MDX pur : frontmatter + composants
   pédagogiques — jamais de HTML/CSS à la main. */

/* Provenance éditoriale (transparence) — qui rédige / qui relit / quel modèle.
   OBLIGATOIRE pour tout contenu publié et finalisé (cf. PROVENANCE_RULE plus
   bas). Le rendu est dérivé dans src/data/provenance.ts. */
const provenance = z
  .object({
    by: z.enum(PROV_BY),
    reviewedBy: z.enum(PROV_REVIEW).optional(),
    model: z.string().optional(),
    translated: z.enum(["human", "ai"]).optional(),
  })
  .optional();

/* Statut transverse d'un contenu : « en construction » / « exemple ».
   Le rendu est dérivé dans src/data/status.ts (cf. StatusBadge). */
const status = z.array(z.enum(STATUS_VALUES)).default([]);

/* La provenance est OBLIGATOIRE pour tout contenu publié et finalisé. En sont
   dispensés : les brouillons (`draft`) et les contenus marqués « en
   construction » ou « exemple » (rien à figer tant que non finalisé). */
const PROVENANCE_RULE = {
  message:
    "Provenance manquante : ajoutez `provenance:` au frontmatter, ou marquez le contenu `draft: true` / `status: [construction]` / `status: [example]`.",
};

const cours = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/cours" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Ordre de tri global, interne — jamais affiché (la numérotation
        visible est PAR SÉRIE, cf. src/data/series.ts). */
    order: z.number(),
    /** Série d'appartenance (un cours = une série de modules) ;
        absent → cours autonome, sans numéro de module. */
    serie: z.enum(SERIE_IDS).optional(),
    topics: z.array(z.enum(TOPIC_IDS)).default([]),
    /** Durée de lecture estimée, en minutes. */
    duration: z.number().optional(),
    /** Pastille de méta (ex. « Fondations »). */
    badge: z.string().optional(),
    /** Mots-clés affichés sur la carte. */
    tags: z.array(z.string()).default([]),
    /** Affiche le panneau terminal à côté de la colonne de lecture. */
    terminal: z.boolean().default(false),
    terminalTitle: z.string().optional(),
    /** Commentaire bash de la 1re ligne du terminal. */
    terminalComment: z.string().optional(),
    /** Provenance éditoriale (humain / IA / révision) — cf. ProvBadge. */
    provenance,
    /** Statut transverse (« en construction » / « exemple ») — cf. StatusBadge. */
    status,
    draft: z.boolean().default(false),
  }).refine(
    (d) => d.draft || d.status.includes("construction") || d.status.includes("example") || d.provenance !== undefined,
    PROVENANCE_RULE,
  ),
});

const miscelanea = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/miscelanea" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topics: z.array(z.enum(TOPIC_IDS)).min(1),
    duration: z.number().optional(),
    date: z.coerce.date().optional(),
    /** Provenance éditoriale (humain / IA / révision) — cf. ProvBadge. */
    provenance,
    /** Statut transverse (« en construction » / « exemple ») — cf. StatusBadge. */
    status,
    draft: z.boolean().default(false),
  }).refine(
    (d) => d.draft || d.status.includes("construction") || d.status.includes("example") || d.provenance !== undefined,
    PROVENANCE_RULE,
  ),
});

export const collections = { cours, miscelanea };
