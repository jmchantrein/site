import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { resourceKindLabel } from "../../data/resources";

export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const resources = (await getCollection("ressources", ({ data, id }) => !data.draft && !id.startsWith("en/")))
    .sort((a, b) => b.data.added.getTime() - a.data.added.getTime());
  return rss({
    title: "IAdmin — quelques recommandations",
    description: "Une sélection personnelle de ressources à explorer.",
    site: new URL(`${base}/explorer/`, context.site ?? "https://jmchantrein.github.io").href,
    items: resources.map((item) => ({
      title: item.data.title,
      description: item.data.summary ?? `${resourceKindLabel(item.data.kind, "fr")} — ${item.data.title}`,
      link: `${base}/explorer/${item.id}/`,
      pubDate: item.data.added,
    })),
    customData: "<language>fr</language>",
  });
}
