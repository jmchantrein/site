export const RESOURCE_KINDS = ["channel", "playlist", "video", "film", "book", "article", "serious-game"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const RESOURCE_KIND_META: Record<ResourceKind, { fr: string; en: string; icon: string }> = {
  channel: { fr: "Chaîne", en: "Channel", icon: "tv" },
  playlist: { fr: "Playlist", en: "Playlist", icon: "list-video" },
  video: { fr: "Vidéo", en: "Video", icon: "video" },
  film: { fr: "Film", en: "Film", icon: "clapperboard" },
  book: { fr: "Livre", en: "Book", icon: "book-open" },
  article: { fr: "Article", en: "Article", icon: "newspaper" },
  "serious-game": { fr: "Jeu sérieux", en: "Serious game", icon: "gamepad-2" },
};

export const resourceKindLabel = (kind: ResourceKind, locale: "fr" | "en") => RESOURCE_KIND_META[kind][locale];
