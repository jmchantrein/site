import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

/** Flux RSS de la version anglaise (/en/) — miroir de src/pages/rss.xml.ts :
    cours dans l'ordre du parcours, articles Miscelánea datés le cas échéant. */
export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cours = (await getCollection("cours", ({ data, id }) => !data.draft && id.startsWith("en/")))
    .sort((a, b) => a.data.order - b.data.order);
  const articles = await getCollection("miscelanea", ({ data, id }) => !data.draft && id.startsWith("en/"));

  return rss({
    title: "Site Astro — teaching framework",
    description:
      "Technical courses and the Miscelánea scientific blog — systems administration, networking, science.",
    site: new URL(`${base}/en/`, context.site ?? "https://jmchantrein.github.io").href,
    items: [
      ...cours.map((c) => ({
        title: c.data.title,
        description: c.data.description,
        link: `${base}/en/cours/${c.id.slice(3)}/`,
      })),
      ...articles.map((a) => ({
        title: a.data.title,
        description: a.data.description,
        link: `${base}/en/miscelanea/${a.id.slice(3)}/`,
        pubDate: a.data.date,
      })),
    ],
    customData: "<language>en</language>",
  });
}
