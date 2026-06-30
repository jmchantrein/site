import type { Provenance } from "./provenance";

/** Séries de cours — la source unique. Un « cours » au sens du site est une
    série de modules (ex. : les 4 pages Docker = un seul cours). Une page de
    la collection `cours` sans `serie` est un cours autonome : elle ne porte
    aucun numéro de module. Le frontmatter `order` reste l'ordre de tri
    global, interne — il ne s'affiche jamais.

    La PROVENANCE (répartition humain ↔ IA) est déclarée UNE fois par cours,
    par langue (`prov.fr` / `prov.en` : la traduction EN ajoute de l'IA), et
    NON par module : chaque module en hérite (cf. displayProvenance). Source
    unique pour le cours entier — plus de provenance répétée page par page. */
export const SERIES = {
  docker: {
    fr: "Fondements de Docker",
    en: "Docker fundamentals",
    /** Chapeau du cours — affiché sur la page de cours (drill-down). */
    desc: {
      fr: "Des fondations (conteneur ou machine virtuelle, images, couches) jusqu'au TP de conteneurisation : maîtriser Docker pas à pas.",
      en: "From the fundamentals (containers vs virtual machines, images, layers) to a hands-on lab: master Docker step by step.",
    },
    /** Provenance du cours (estimation déclarée, pas une mesure). Globale au
        cours, affichée sur le cours ET sur chacun de ses modules. */
    prov: {
      fr: { by: "human", reviewedBy: "ai", model: "Claude Opus 4.x", aiShare: 20 },
      en: { by: "human", reviewedBy: "ai", model: "Claude Opus 4.x", translated: "ai", aiShare: 60 },
    },
  },
} as const satisfies Record<string, { fr: string; en: string; desc: { fr: string; en: string }; prov: { fr: Provenance; en: Provenance } }>;

export type SerieId = keyof typeof SERIES;
export const SERIE_IDS = Object.keys(SERIES) as [SerieId, ...SerieId[]];

interface CourseLike {
  id: string;
  data: { serie?: string | undefined; order: number };
}

/** Numérotation PAR SÉRIE : id → { num: "01", total, serie }.
    Les cours autonomes (sans série) n'y figurent pas. */
export function serieNumbers(cours: CourseLike[]) {
  const groups = new Map<string, string[]>();
  for (const c of [...cours].sort((a, b) => a.data.order - b.data.order)) {
    if (!c.data.serie) continue;
    const g = groups.get(c.data.serie) ?? [];
    g.push(c.id);
    groups.set(c.data.serie, g);
  }
  const out = new Map<string, { num: string; total: number; serie: SerieId }>();
  for (const [s, ids] of groups) {
    ids.forEach((id, i) =>
      out.set(id, { num: String(i + 1).padStart(2, "0"), total: ids.length, serie: s as SerieId }),
    );
  }
  return out;
}

export type CourseUnit<T> =
  | { kind: "serie"; serie: SerieId; modules: T[] }
  | { kind: "standalone"; entry: T };

/** « Unités de cours » pour l'index Cours, dans l'ordre global : chaque série
    figure UNE fois (à la position de son 1er module), accompagnée de ses
    modules ; chaque page sans série est un cours autonome. C'est ce niveau —
    le cours, pas le module — qui s'affiche sur l'index (cf. pages de cours). */
export function courseUnits<T extends CourseLike>(cours: T[]): CourseUnit<T>[] {
  const sorted = [...cours].sort((a, b) => a.data.order - b.data.order);
  const seen = new Set<string>();
  const units: CourseUnit<T>[] = [];
  for (const c of sorted) {
    if (!c.data.serie) {
      units.push({ kind: "standalone", entry: c });
      continue;
    }
    if (seen.has(c.data.serie)) continue;
    seen.add(c.data.serie);
    units.push({
      kind: "serie",
      serie: c.data.serie as SerieId,
      modules: sorted.filter((x) => x.data.serie === c.data.serie),
    });
  }
  return units;
}

/** Provenance d'affichage d'un contenu : celle de SA SÉRIE (déclarée une fois
    au niveau du cours, par langue) si le contenu appartient à une série ;
    sinon celle déclarée par le contenu lui-même (cours autonome / article). */
export function displayProvenance(
  data: { serie?: string | undefined; provenance?: Provenance },
  locale: "fr" | "en",
): Provenance | undefined {
  if (data.serie && data.serie in SERIES) {
    return SERIES[data.serie as SerieId].prov[locale];
  }
  return data.provenance;
}
