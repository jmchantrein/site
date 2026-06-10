/** Thématiques du site — la source unique (cours ET articles s'y réfèrent).
    Un contenu peut appartenir à plusieurs thématiques : il apparaît alors
    dans chaque vue, sans duplication. */
export const TOPICS = {
  linux: "Administration systèmes GNU/Linux",
  reseau: "Réseau",
  sciences: "Sciences & calcul",
  divers: "Divers",
} as const;

export type TopicId = keyof typeof TOPICS;
export const TOPIC_IDS = Object.keys(TOPICS) as [TopicId, ...TopicId[]];
