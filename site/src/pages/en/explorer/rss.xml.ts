import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { resourceKindLabel } from "../../../data/resources";

export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const resources = (await getCollection("ressources", ({ data, id }) => !data.draft && id.startsWith("en/")))
    .sort((a, b) => b.data.added.getTime() - a.data.added.getTime());
  return rss({
    title: "IAdmin — a few recommendations",
    description: "A personal selection of resources worth exploring.",
    site: new URL(`${base}/en/explorer/`, context.site ?? "https://jmchantrein.github.io").href,
    items: resources.map((item) => ({
      title: item.data.title,
      description: item.data.summary ?? `${resourceKindLabel(item.data.kind, "en")} — ${item.data.title}`,
      link: `${base}/en/explorer/${item.id.slice(3)}/`,
      pubDate: item.data.added,
    })),
    customData: "<language>en</language>",
  });
}
