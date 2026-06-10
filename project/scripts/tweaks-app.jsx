/* =============================================================================
   TWEAKS-APP — paramètres d'AUTEUR / exploration design (distinct du panneau
   « Confort » destiné au lecteur). N'apparaît que lorsque le mode Tweaks est actif.
   - Exploration des familles typographiques (serif / sans / mono).
   - Réglage pédagogique : « exiger une réponse avant la solution » (défaut ON),
     qui pilote le verrou des blocs exercice via html[data-require-answer].
   La palette de couleurs est désormais gérée par les THÈMES (panneau Confort).
   ============================================================================= */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "serif": "Source Serif 4",
  "sans": "Public Sans",
  "mono": "IBM Plex Mono"
}/*EDITMODE-END*/;

const SERIF_STACKS = {
  "Source Serif 4": '"Source Serif 4", Georgia, serif',
  "Spectral":       '"Spectral", Georgia, serif',
  "Newsreader":     '"Newsreader", Georgia, serif',
  "Lora":           '"Lora", Georgia, serif'
};
const SANS_STACKS = {
  "Public Sans":           '"Public Sans", system-ui, sans-serif',
  "Atkinson Hyperlegible": '"Atkinson Hyperlegible", system-ui, sans-serif',
  "Source Sans 3":         '"Source Sans 3", system-ui, sans-serif',
  "IBM Plex Sans":         '"IBM Plex Sans", system-ui, sans-serif'
};
const MONO_STACKS = {
  "IBM Plex Mono":  '"IBM Plex Mono", ui-monospace, monospace',
  "JetBrains Mono": '"JetBrains Mono", ui-monospace, monospace'
};

/* Familles d'exploration chargées À LA DEMANDE — les pages n'embarquent que
   les familles par défaut (+ Atkinson, proposée au lecteur par le panneau a11y). */
const FONT_CSS_URLS = {
  "Spectral":       "https://fonts.googleapis.com/css2?family=Spectral:wght@500;600;700&display=swap",
  "Newsreader":     "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600;6..72,700&display=swap",
  "Lora":           "https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&display=swap",
  "Source Sans 3":  "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap",
  "IBM Plex Sans":  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap",
  "JetBrains Mono": "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap"
};
function ensureFontCss(family) {
  const url = FONT_CSS_URLS[family];
  if (!url || document.querySelector('link[data-tweak-font="' + family + '"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet"; link.href = url;
  link.setAttribute("data-tweak-font", family);
  document.head.appendChild(link);
}

function applyTweaks(t) {
  const r = document.documentElement;
  [t.serif, t.sans, t.mono].forEach(ensureFontCss);
  r.style.setProperty("--font-serif", SERIF_STACKS[t.serif] || SERIF_STACKS["Source Serif 4"]);
  r.style.setProperty("--font-sans",  SANS_STACKS[t.sans]   || SANS_STACKS["Public Sans"]);
  r.style.setProperty("--font-mono",  MONO_STACKS[t.mono]   || MONO_STACKS["IBM Plex Mono"]);
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);
  return (
    React.createElement(TweaksPanel, { title: "Paramètres" },
      React.createElement(TweakSection, { label: "Typographie — titres (serif)" }),
      React.createElement(TweakSelect, {
        label: "Serif", value: t.serif, options: Object.keys(SERIF_STACKS),
        onChange: (v) => setTweak("serif", v)
      }),
      React.createElement(TweakSection, { label: "Typographie — corps (sans)" }),
      React.createElement(TweakSelect, {
        label: "Sans", value: t.sans, options: Object.keys(SANS_STACKS),
        onChange: (v) => setTweak("sans", v)
      }),
      React.createElement(TweakSelect, {
        label: "Mono", value: t.mono, options: Object.keys(MONO_STACKS),
        onChange: (v) => setTweak("mono", v)
      }),
    )
  );
}

(function mountTweaks() {
  const el = document.getElementById("tweaks-root");
  if (el && window.ReactDOM && ReactDOM.createRoot) {
    ReactDOM.createRoot(el).render(React.createElement(TweaksApp));
  }
})();
