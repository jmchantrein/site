import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

/** Flux RSS de l'entièreté du site : cours (dans l'ordre du parcours)
    et articles Miscelánea (datés quand le frontmatter le précise). */
export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cours = (await getCollection("cours", ({ data, id }) => !data.draft && !id.startsWith("en/")))
    .sort((a, b) => a.data.order - b.data.order);
  const articles = await getCollection("miscelanea", ({ data, id }) => !data.draft && !id.startsWith("en/"));

  return rss({
    title: "IAdmin — systèmes, automatisation et IA",
    description:
      "Cours et articles sur l'administration système, l'automatisation et l'intelligence artificielle.",
    site: new URL(`${base}/`, context.site ?? "https://jmchantrein.github.io").href,
    items: [
      ...cours.map((c) => ({
        title: c.data.title,
        description: c.data.description,
        link: `${base}/cours/${c.id}/`,
      })),
      ...articles.map((a) => ({
        title: a.data.title,
        description: a.data.description,
        link: `${base}/miscelanea/${a.id}/`,
        pubDate: a.data.date,
      })),
    ],
    customData: "<language>fr</language>",
  });
}
