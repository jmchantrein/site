import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TOPIC_IDS } from "./data/topics";

/* Le contenu vit dans src/content/ en MDX pur : frontmatter + composants
   pédagogiques — jamais de HTML/CSS à la main. */

const cours = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/cours" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Ordre dans le parcours (01, 02…). */
    order: z.number(),
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
    draft: z.boolean().default(false),
  }),
});

const miscelanea = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/miscelanea" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topics: z.array(z.enum(TOPIC_IDS)).min(1),
    duration: z.number().optional(),
    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { cours, miscelanea };
