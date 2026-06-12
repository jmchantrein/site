/** DOCK — registre des applications de l'en-tête (source unique).
    `pastime: true` = passe-temps : icône grisée hors des pauses Pomodoro
    (25 min de lecture active → 5 min de jeu). Le terminal et le Pomodoro
    sont des outils, toujours disponibles. */
export interface DockApp {
  id: string;
  icon: string; // nom dans src/components/Icon.astro
  fr: string;
  en: string;
  pastime: boolean;
  /** Affiche le bouton ⋮ d'options (menu géré par dock.js). */
  options?: boolean;
}

export const DOCK_APPS: DockApp[] = [
  { id: "terminal", icon: "square-terminal", fr: "Terminal", en: "Terminal", pastime: false, options: true },
  { id: "pomodoro", icon: "timer", fr: "Pomodoro", en: "Pomodoro", pastime: false },
  { id: "snake", icon: "worm", fr: "Snake", en: "Snake", pastime: true },
  { id: "g2048", icon: "grid", fr: "2048", en: "2048", pastime: true },
  { id: "gol", icon: "boxes", fr: "Jeu de la vie", en: "Game of Life", pastime: true },
];
