/** Locale de la page en cours de rendu, déduite de l'URL (le contenu EN vit
    sous /en/). Sert aux composants instanciés depuis le MDX, qui ne reçoivent
    pas de prop `locale` : la prose bilingue passe par les doublons
    `data-lang`, mais les ATTRIBUTS (aria-label, placeholder, libellés par
    défaut…) doivent être résolus au build dans la langue de la page. */
export type Locale = "fr" | "en";

export function pageLocale(url: URL): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const p = url.pathname;
  return p === `${base}/en` || p.startsWith(`${base}/en/`) ? "en" : "fr";
}
