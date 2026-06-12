/** Séries de cours — la source unique. Un « cours » au sens du site est une
    série de modules (ex. : les 4 pages Docker = un seul cours). Une page de
    la collection `cours` sans `serie` est un cours autonome : elle ne porte
    aucun numéro de module. Le frontmatter `order` reste l'ordre de tri
    global, interne — il ne s'affiche jamais. */
export const SERIES = {
  docker: { fr: "Fondements de Docker", en: "Docker fundamentals" },
} as const;

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
