/* STATUT d'un contenu (cours/article) — marqueurs d'état transverses, DISTINCTS
   de la provenance : « en construction » (incomplet, en cours de rédaction) et
   « exemple » (contenu de démonstration). Applicables à n'importe quel contenu
   (cours, module, article…). Rendu défini une fois — voir StatusBadge.astro. */

export type Status = "construction" | "example";
/** Tuple typé pour z.enum (même forme que TOPIC_IDS / PROV_BY). */
export const STATUS_VALUES = ["construction", "example"] as [Status, ...Status[]];

type Locale = "fr" | "en";

export interface StatusView {
  key: Status;
  icon: string;
  label: string;
  title: string;
}

const ICON: Record<Status, string> = {
  construction: "construction",
  example: "flask-conical",
};
const LABEL: Record<Locale, Record<Status, string>> = {
  fr: { construction: "En construction", example: "Exemple" },
  en: { construction: "Under construction", example: "Example" },
};
const TITLE: Record<Locale, Record<Status, string>> = {
  fr: {
    construction: "Contenu en cours de rédaction — incomplet, susceptible de changer.",
    example: "Contenu d'exemple, à visée de démonstration.",
  },
  en: {
    construction: "Work in progress — incomplete and subject to change.",
    example: "Example content, for demonstration purposes.",
  },
};

export function statusView(s: Status, locale: Locale = "fr"): StatusView {
  return { key: s, icon: ICON[s], label: LABEL[locale][s], title: TITLE[locale][s] };
}
