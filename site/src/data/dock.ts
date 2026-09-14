/** DOCK — registre des deux outils disponibles dans l'en-tête. */
export interface DockApp {
  id: string;
  icon: string; // nom dans src/components/Icon.astro
  fr: string;
  en: string;
  /** Affiche le bouton ⋮ d'options (menu géré par dock.js). */
  options?: boolean;
}

export const DOCK_APPS: DockApp[] = [
  { id: "terminal", icon: "square-terminal", fr: "Terminal", en: "Terminal", options: true },
  { id: "pomodoro", icon: "timer", fr: "Pomodoro", en: "Pomodoro" },
];
