/** Outils d'indexation au build : liens retour du glossaire et ressources. */

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function glossaryMentions(entry, contents, locale) {
  const forms = locale === "en"
    ? [entry.en, ...(entry.aliasEn ?? [])]
    : [entry.fr, ...(entry.aliasFr ?? []), ...(entry.angl ? [entry.en] : [])];
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])(?:${forms.filter(Boolean).map(escapeRegExp).join("|")})(?=$|[^\\p{L}\\p{N}])`,
    "iu",
  );
  return contents.filter((content) => pattern.test(content.body ?? ""));
}

const markdownLink = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const videoEmbed = /<VideoEmbed\s+([^>]*?)\/>/g;
const prop = (source, name) => source.match(new RegExp(`${name}=["']([^"']+)["']`))?.[1];

export function contentResources(contents) {
  const videos = new Map();
  const links = new Map();

  const usageOf = (content) => {
    const english = content.id.startsWith("en/");
    const slug = english ? content.id.slice(3) : content.id;
    const prefix = english ? "/en" : "";
    return {
      title: content.data.title,
      href: `${prefix}/${content.collection === "cours" ? "cours" : "miscelanea"}/${slug}/`,
    };
  };
  const add = (map, key, resource, content) => {
    const current = map.get(key) ?? { ...resource, usages: [] };
    const usage = usageOf(content);
    if (!current.usages.some((item) => item.href === usage.href)) current.usages.push(usage);
    map.set(key, current);
  };

  for (const content of contents) {
    for (const match of content.body.matchAll(videoEmbed)) {
      const attrs = match[1];
      const id = prop(attrs, "id");
      const playlistId = prop(attrs, "playlistId");
      const title = prop(attrs, "title");
      if (title && (id || playlistId)) add(videos, id ? `v:${id}` : `p:${playlistId}`, { id, playlistId, title }, content);
    }
    for (const match of content.body.matchAll(markdownLink)) {
      const [, title, url] = match;
      const parsed = new URL(url);
      if (/^(?:www\.)?(?:youtube\.com|youtu\.be)$/.test(parsed.hostname)) {
        const id = parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
        const playlistId = parsed.searchParams.get("list");
        if (id || playlistId) add(videos, id ? `v:${id}` : `p:${playlistId}`, { id, playlistId, title }, content);
      } else if (!/(?:^|\.)wikipedia\.org$|(?:^|\.)wikimedia\.org$/.test(parsed.hostname)) {
        add(links, url, { title, url }, content);
      }
    }
  }
  return { videos: [...videos.values()], links: [...links.values()] };
}
