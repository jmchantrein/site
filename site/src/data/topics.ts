/** Thématiques du site — la source unique (cours ET articles s'y réfèrent).
    Un contenu peut appartenir à plusieurs thématiques : il apparaît alors
    dans chaque vue, sans duplication. */
export const TOPICS = {
  linux: { fr: "Administration systèmes GNU/Linux", en: "GNU/Linux systems administration" },
  reseau: { fr: "Réseau", en: "Networking" },
  dev: { fr: "Développement", en: "Development" },
  gui: { fr: "Interfaces graphiques", en: "Graphical interfaces" },
  sciences: { fr: "Sciences & calcul", en: "Science & computing" },
  intelligence_artificielle: { fr: "Intelligence artificielle", en: "Artificial intelligence" },
  technique: { fr: "Technique", en: "Technical" },
  esprit_critique: { fr: "Esprit critique", en: "Critical thinking" },
  reflexion: { fr: "Réflexion", en: "Reflection" },
  numerique_societe: { fr: "Numérique et société", en: "Digital technology & society" },
  divers: { fr: "Divers", en: "Miscellaneous" },
} as const;

export type TopicId = keyof typeof TOPICS;
export const TOPIC_IDS = Object.keys(TOPICS) as [TopicId, ...TopicId[]];

export const topicLabel = (id: TopicId, locale: "fr" | "en" = "fr") => TOPICS[id][locale];
