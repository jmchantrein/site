/* =============================================================================
   SITE.JS — runtime partagé
   - Panneau d'accessibilité (injecté, persistant via localStorage)
   - Bascule de langue FR/EN
   - Terminal « live » + commandes cliquables
   - Exercices repliables (libellés)
   - Rendu KaTeX
   ============================================================================= */
(function () {
  "use strict";

  var STORE = "site-astro-prefs-v1";
  var root = document.documentElement;

  var DEFAULTS = {
    scale: 1,        // 0.9 .. 1.6
    leading: 1.6,    // 1.4 .. 2.0  (≥1.5 supporté — WCAG 1.4.12)
    letter: 0,       // 0 .. 0.12 em
    word: 0,         // 0 .. 0.16 em
    contrast: false,
    motion: "auto",  // "auto" | "on" | "off"
    readfont: "default", // default | atkinson | dyslexic
    theme: "abysse", // marine | ardoise | foret | aurore | abysse
    depth: true,     // effet de plongée au scroll (Paramètres)
    requireAnswer: true, // exiger une réponse avant d'afficher la solution
    width: 72,       // largeur globale du site en rem (60..160), bornée à 98vw
    lang: "fr"
  };

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || "{}");
      return Object.assign({}, DEFAULTS, s);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save(p) { try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) {} }

  var prefs = load();

  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function apply() {
    root.style.fontSize = (prefs.scale * 100).toFixed(0) + "%";
    root.style.setProperty("--leading-body", String(prefs.leading));
    root.style.setProperty("--tracking", prefs.letter + "em");
    root.style.setProperty("--word-spacing", prefs.word + "em");
    if (prefs.contrast) root.setAttribute("data-contrast", "high"); else root.removeAttribute("data-contrast");

    var motionOff = prefs.motion === "off" || (prefs.motion === "auto" && prefersReduced);
    if (motionOff) root.setAttribute("data-motion", "off"); else root.removeAttribute("data-motion");

    if (prefs.readfont && prefs.readfont !== "default") root.setAttribute("data-readfont", prefs.readfont);
    else root.removeAttribute("data-readfont");

    root.setAttribute("data-theme", prefs.theme || "abysse");

    // Largeur globale du site (compact → quasi pleine largeur), bornée à 98vw
    var w = prefs.width || 72;
    root.style.setProperty("--page-max", "min(" + w + "rem, 98vw)");
    if (typeof window.__saReposWidthGrip === "function") window.__saReposWidthGrip();

    // Exercices : exiger une réponse avant la solution (Paramètres, ON par défaut)
    root.setAttribute("data-require-answer", prefs.requireAnswer === false ? "off" : "on");
    document.dispatchEvent(new CustomEvent("sa:require-answer"));

    // Effet de plongée : activable seulement sur les pages compatibles
    if (document.body.hasAttribute("data-depth-capable")) {
      if (prefs.depth !== false) document.body.setAttribute("data-depth-scroll", "");
      else document.body.removeAttribute("data-depth-scroll");
    }
    if (typeof window.__saUpdateDepth === "function") window.__saUpdateDepth();

    root.setAttribute("lang", prefs.lang);
    syncLangButtons();
  }

  /* ---- Bascule de langue ------------------------------------------------- */
  function setLang(l) { prefs.lang = l; save(prefs); apply(); }
  function syncLangButtons() {
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      var cur = btn.querySelector("[data-lang-cur]");
      if (cur) cur.textContent = prefs.lang.toUpperCase();
      btn.setAttribute("aria-label", prefs.lang === "fr" ? "Langue : Français — basculer en anglais" : "Language: English — switch to French");
    });
    document.querySelectorAll("[data-a11y-lang] button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === prefs.lang));
    });
  }

  /* ---- Injection des panneaux : Accessibilité + Paramètres --------------- */
  function panelHTML() {
    return '' +
'<div class="a11y-overlay" data-a11y-overlay></div>' +

/* ===================== ACCESSIBILITÉ (WCAG) ===================== */
'<aside class="a11y-panel" data-a11y-panel role="dialog" aria-modal="true" aria-labelledby="a11y-title" tabindex="-1">' +
'  <div class="a11y-panel__head">' +
'    <i data-lucide="eye" aria-hidden="true" style="width:24px;height:24px;flex:none;color:var(--color-accent-text)"></i>' +
'    <div><h2 id="a11y-title"><span data-lang="fr">Accessibilité</span><span data-lang="en">Accessibility</span></h2>' +
'    <span class="sub">WCAG 1.4.12 / 2.3.3 / 1.4.6</span></div>' +
'    <button class="a11y-close" data-a11y-close aria-label="Fermer le panneau">✕</button>' +
'  </div>' +
'  <div class="a11y-panel__body">' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span><span data-lang="fr">Taille du texte</span><span data-lang="en">Text size</span></span><span class="a11y-field__value" data-a11y-scaleval>100%</span></span>' +
'      <div class="a11y-stepper">' +
'        <button data-a11y-scale="-1" aria-label="Réduire la taille du texte">A−</button>' +
'        <output data-a11y-scaleout>100%</output>' +
'        <button data-a11y-scale="1" aria-label="Augmenter la taille du texte">A+</button>' +
'      </div>' +
'    </div>' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span><span data-lang="fr">Interligne</span><span data-lang="en">Line height</span></span><span class="a11y-field__value" data-a11y-leadval>1.6</span></span>' +
'      <input class="a11y-range" type="range" min="1.4" max="2" step="0.05" data-a11y-lead aria-label="Interligne">' +
'      <p class="a11y-field__help"><span data-lang="fr">Seuil recommandé : 1,5× minimum.</span><span data-lang="en">Recommended threshold: at least 1.5×.</span></p>' +
'    </div>' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span><span data-lang="fr">Espacement des lettres</span><span data-lang="en">Letter spacing</span></span><span class="a11y-field__value" data-a11y-letterval>0.00em</span></span>' +
'      <input class="a11y-range" type="range" min="0" max="0.12" step="0.01" data-a11y-letter aria-label="Espacement des lettres">' +
'    </div>' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span><span data-lang="fr">Espacement des mots</span><span data-lang="en">Word spacing</span></span><span class="a11y-field__value" data-a11y-wordval>0.00em</span></span>' +
'      <input class="a11y-range" type="range" min="0" max="0.16" step="0.01" data-a11y-word aria-label="Espacement des mots">' +
'      <div class="a11y-preview" aria-hidden="true"><p><span data-lang="fr">Un conteneur isole un processus et son système de fichiers.</span><span data-lang="en">A container isolates a process and its filesystem.</span></p></div>' +
'    </div>' +

'    <div class="a11y-section-title"><span data-lang="fr">Modes</span><span data-lang="en">Modes</span></div>' +

'    <label class="a11y-toggle">' +
'      <input type="checkbox" data-a11y-contrast>' +
'      <span class="a11y-toggle__sw" aria-hidden="true"></span>' +
'      <span class="a11y-toggle__text"><b><span data-lang="fr">Contraste élevé</span><span data-lang="en">High contrast</span></b><small><span data-lang="fr">Renforce le corps au-delà de 7:1</span><span data-lang="en">Pushes body text beyond 7:1</span></small></span>' +
'      <span class="a11y-toggle__state"><span class="on">ON</span><span class="off">OFF</span></span>' +
'    </label>' +

'    <label class="a11y-toggle">' +
'      <input type="checkbox" data-a11y-motion>' +
'      <span class="a11y-toggle__sw" aria-hidden="true"></span>' +
'      <span class="a11y-toggle__text"><b><span data-lang="fr">Réduire les animations</span><span data-lang="en">Reduce motion</span></b><small><span data-lang="fr">Fige le terminal, le scroll et les transitions</span><span data-lang="en">Freezes terminal, scroll and transitions</span></small></span>' +
'      <span class="a11y-toggle__state"><span class="on">ON</span><span class="off">OFF</span></span>' +
'    </label>' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span data-lang="fr">Police de lecture</span><span data-lang="en">Reading font</span></span>' +
'      <div class="a11y-seg" data-a11y-font role="group" aria-label="Police de lecture">' +
'        <button data-set-font="default"><span data-lang="fr">Défaut</span><span data-lang="en">Default</span></button>' +
'        <button data-set-font="atkinson">Atkinson</button>' +
'        <button data-set-font="dyslexic">OpenDyslexic</button>' +
'      </div>' +
'      <p class="a11y-field__help"><span data-lang="fr">Proposée, jamais imposée. Atkinson Hyperlegible distingue mieux les caractères proches ; OpenDyslexic aide certains lecteurs dyslexiques.</span><span data-lang="en">Offered, never forced. Atkinson Hyperlegible better distinguishes similar glyphs; OpenDyslexic helps some dyslexic readers.</span></p>' +
'    </div>' +

'  </div>' +
'  <div class="a11y-panel__foot">' +
'    <button class="a11y-reset" data-a11y-reset><span data-lang="fr">Réinitialiser</span><span data-lang="en">Reset</span></button>' +
'    <span class="a11y-saved"><span data-lang="fr">Préférences enregistrées</span><span data-lang="en">Preferences saved</span></span>' +
'  </div>' +
'</aside>' +

/* ===================== PARAMÈTRES (apparence) ===================== */
'<aside class="a11y-panel" data-settings-panel role="dialog" aria-modal="true" aria-labelledby="set-title" tabindex="-1">' +
'  <div class="a11y-panel__head">' +
'    <i data-lucide="settings" aria-hidden="true" style="width:24px;height:24px;flex:none;color:var(--color-accent-text)"></i>' +
'    <div><h2 id="set-title"><span data-lang="fr">Paramètres</span><span data-lang="en">Settings</span></h2>' +
'    <span class="sub"><span data-lang="fr">apparence &amp; préférences</span><span data-lang="en">appearance &amp; preferences</span></span></div>' +
'    <button class="a11y-close" data-settings-close aria-label="Fermer le panneau">✕</button>' +
'  </div>' +
'  <div class="a11y-panel__body">' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span data-lang="fr">Thème de couleurs</span><span data-lang="en">Color theme</span></span>' +
'      <div class="a11y-themes" data-a11y-theme role="group" aria-label="Thème de couleurs">' +
'        <button data-set-theme="marine" type="button"><span class="sw" style="background:linear-gradient(135deg,#e9f0f3 50%,#0b5067 50%)"></span>Marine</button>' +
'        <button data-set-theme="ardoise" type="button"><span class="sw" style="background:linear-gradient(135deg,#f4f6f9 50%,#1e40af 50%)"></span>Ardoise</button>' +
'        <button data-set-theme="foret" type="button"><span class="sw" style="background:linear-gradient(135deg,#eef3ee 50%,#14532d 50%)"></span><span data-lang="fr">Forêt</span><span data-lang="en">Forest</span></button>' +
'        <button data-set-theme="aurore" type="button"><span class="sw" style="background:linear-gradient(135deg,#f5efe4 50%,#0b5067 50%)"></span><span data-lang="fr">Aurore</span><span data-lang="en">Dawn</span></button>' +
'        <button data-set-theme="abysse" type="button"><span class="sw" style="background:linear-gradient(135deg,#0a1822 50%,#6fc7e6 50%)"></span><span data-lang="fr">Abysse</span><span data-lang="en">Abyss</span></button>' +
'      </div>' +
'      <p class="a11y-field__help"><span data-lang="fr">Le mode contraste élevé (Accessibilité) prime sur le thème choisi.</span><span data-lang="en">High-contrast mode (Accessibility) overrides the chosen theme.</span></p>' +
'    </div>' +

'    <label class="a11y-toggle">' +
'      <input type="checkbox" data-a11y-depth>' +
'      <span class="a11y-toggle__sw" aria-hidden="true"></span>' +
'      <span class="a11y-toggle__text"><b><span data-lang="fr">Effet de plongée au défilement</span><span data-lang="en">Depth effect on scroll</span></b><small><span data-lang="fr">Le fond s\'assombrit, le panneau de lecture s\'éclaircit (contraste préservé)</span><span data-lang="en">Background darkens, the reading panel brightens (contrast preserved)</span></small></span>' +
'      <span class="a11y-toggle__state"><span class="on">ON</span><span class="off">OFF</span></span>' +
'    </label>' +

'    <label class="a11y-toggle">' +
'      <input type="checkbox" data-a11y-require>' +
'      <span class="a11y-toggle__sw" aria-hidden="true"></span>' +
'      <span class="a11y-toggle__text"><b><span data-lang="fr">Exiger une réponse avant la correction</span><span data-lang="en">Require an answer before the solution</span></b><small><span data-lang="fr">Verrouille la solution des exercices tant que le champ réponse est vide</span><span data-lang="en">Locks an exercise solution until the answer field is filled</span></small></span>' +
'      <span class="a11y-toggle__state"><span class="on">ON</span><span class="off">OFF</span></span>' +
'    </label>' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span><span data-lang="fr">Largeur du site</span><span data-lang="en">Site width</span></span><span class="a11y-field__value" data-a11y-widthval>72 rem</span></span>' +
'      <input class="a11y-range" type="range" min="60" max="160" step="2" data-a11y-width aria-label="Largeur globale du site">' +
'      <p class="a11y-field__help"><span data-lang="fr">De compact à quasi pleine largeur (borné à la fenêtre).</span><span data-lang="en">From compact to nearly full width (capped to the window).</span></p>' +
'    </div>' +

'    <div class="a11y-field">' +
'      <span class="a11y-field__label"><span data-lang="fr">Langue</span><span data-lang="en">Language</span></span>' +
'      <div class="a11y-seg" data-a11y-lang role="group" aria-label="Langue">' +
'        <button data-set-lang="fr">Français</button>' +
'        <button data-set-lang="en">English</button>' +
'      </div>' +
'    </div>' +

'  </div>' +
'  <div class="a11y-panel__foot">' +
'    <button class="a11y-reset" data-a11y-reset><span data-lang="fr">Réinitialiser</span><span data-lang="en">Reset</span></button>' +
'    <span class="a11y-saved"><span data-lang="fr">Préférences enregistrées</span><span data-lang="en">Preferences saved</span></span>' +
'  </div>' +
'</aside>';
  }

  var lastFocus = null, openName = null;
  function qp(s) { return document.querySelector(s); }
  function setTriggers() {
    document.querySelectorAll("[data-a11y-trigger]").forEach(function (t) { t.setAttribute("aria-expanded", String(openName === "a11y")); });
    document.querySelectorAll("[data-settings-trigger]").forEach(function (t) { t.setAttribute("aria-expanded", String(openName === "settings")); });
  }
  function currentPanel() { return openName === "settings" ? qp("[data-settings-panel]") : qp("[data-a11y-panel]"); }
  function openPanel(name) {
    name = name || "a11y";
    qp("[data-a11y-panel]").removeAttribute("data-open");
    qp("[data-settings-panel]").removeAttribute("data-open");
    var pn = name === "settings" ? qp("[data-settings-panel]") : qp("[data-a11y-panel]");
    lastFocus = document.activeElement; openName = name;
    qp("[data-a11y-overlay]").setAttribute("data-open", "true");
    pn.setAttribute("data-open", "true");
    setTriggers();
    pn.focus();
    document.addEventListener("keydown", onKey);
  }
  function closePanel() {
    qp("[data-a11y-overlay]").removeAttribute("data-open");
    qp("[data-a11y-panel]").removeAttribute("data-open");
    qp("[data-settings-panel]").removeAttribute("data-open");
    openName = null; setTriggers();
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") closePanel();
    if (e.key === "Tab") {
      var pn = currentPanel(); if (!pn) return;
      var f = pn.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function syncControls() {
    var q = function (s) { return document.querySelector(s); };
    if (q("[data-a11y-scaleval]")) q("[data-a11y-scaleval]").textContent = Math.round(prefs.scale * 100) + "%";
    if (q("[data-a11y-scaleout]")) q("[data-a11y-scaleout]").textContent = Math.round(prefs.scale * 100) + "%";
    if (q("[data-a11y-lead]")) { q("[data-a11y-lead]").value = prefs.leading; q("[data-a11y-leadval]").textContent = Number(prefs.leading).toFixed(2).replace(/0$/, "").replace(/\.$/, ""); }
    if (q("[data-a11y-letter]")) { q("[data-a11y-letter]").value = prefs.letter; q("[data-a11y-letterval]").textContent = Number(prefs.letter).toFixed(2) + "em"; }
    if (q("[data-a11y-word]")) { q("[data-a11y-word]").value = prefs.word; q("[data-a11y-wordval]").textContent = Number(prefs.word).toFixed(2) + "em"; }
    if (q("[data-a11y-contrast]")) q("[data-a11y-contrast]").checked = !!prefs.contrast;
    var motionOff = prefs.motion === "off" || (prefs.motion === "auto" && prefersReduced);
    if (q("[data-a11y-motion]")) q("[data-a11y-motion]").checked = motionOff;
    if (q("[data-a11y-depth]")) q("[data-a11y-depth]").checked = prefs.depth !== false;
    if (q("[data-a11y-require]")) q("[data-a11y-require]").checked = prefs.requireAnswer !== false;
    if (q("[data-a11y-width]")) {
      q("[data-a11y-width]").value = prefs.width || 72;
      var wv = q("[data-a11y-widthval]");
      if (wv) wv.textContent = (prefs.width >= 160) ? (prefs.lang === "en" ? "full" : "plein") : (prefs.width || 72) + " rem";
    }
    document.querySelectorAll("[data-a11y-font] button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-font") === prefs.readfont));
    });
    document.querySelectorAll("[data-a11y-theme] button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-theme") === (prefs.theme || "abysse")));
    });
    var sc = document.querySelector('[data-a11y-scale="-1"]'), si = document.querySelector('[data-a11y-scale="1"]');
    if (sc) sc.disabled = prefs.scale <= 0.9;
    if (si) si.disabled = prefs.scale >= 1.6;
    syncLangButtons();
  }

  function wirePanel() {
    document.body.insertAdjacentHTML("beforeend", panelHTML());
    document.querySelectorAll("[data-a11y-trigger]").forEach(function (t) {
      t.addEventListener("click", function () {
        if (openName === "a11y") closePanel(); else openPanel("a11y");
      });
    });
    document.querySelectorAll("[data-settings-trigger]").forEach(function (t) {
      t.addEventListener("click", function () {
        if (openName === "settings") closePanel(); else openPanel("settings");
      });
    });
    document.querySelector("[data-a11y-overlay]").addEventListener("click", closePanel);
    document.querySelectorAll("[data-a11y-close], [data-settings-close]").forEach(function (b) {
      b.addEventListener("click", closePanel);
    });

    document.querySelectorAll("[data-a11y-scale]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = parseInt(b.getAttribute("data-a11y-scale"), 10) * 0.1;
        prefs.scale = Math.min(1.6, Math.max(0.9, Math.round((prefs.scale + d) * 10) / 10));
        save(prefs); apply(); syncControls();
      });
    });
    var bind = function (sel, key, parse) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.addEventListener("input", function () { prefs[key] = parse(el.value); save(prefs); apply(); syncControls(); });
    };
    bind("[data-a11y-lead]", "leading", parseFloat);
    bind("[data-a11y-letter]", "letter", parseFloat);
    bind("[data-a11y-word]", "word", parseFloat);
    bind("[data-a11y-width]", "width", parseFloat);

    document.querySelector("[data-a11y-contrast]").addEventListener("change", function (e) { prefs.contrast = e.target.checked; save(prefs); apply(); syncControls(); });
    document.querySelector("[data-a11y-motion]").addEventListener("change", function (e) { prefs.motion = e.target.checked ? "off" : "on"; save(prefs); apply(); syncControls(); });
    document.querySelector("[data-a11y-depth]").addEventListener("change", function (e) { prefs.depth = e.target.checked; save(prefs); apply(); syncControls(); });

    document.querySelector("[data-a11y-require]").addEventListener("change", function (e) { prefs.requireAnswer = e.target.checked; save(prefs); apply(); syncControls(); });
    document.querySelectorAll("[data-a11y-font] button").forEach(function (b) {
      b.addEventListener("click", function () { prefs.readfont = b.getAttribute("data-set-font"); save(prefs); apply(); syncControls(); });
    });
    document.querySelectorAll("[data-a11y-theme] button").forEach(function (b) {
      b.addEventListener("click", function () { prefs.theme = b.getAttribute("data-set-theme"); save(prefs); apply(); syncControls(); });
    });
    document.querySelectorAll("[data-a11y-lang] button").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang")); syncControls(); });
    });
    document.querySelectorAll("[data-a11y-reset]").forEach(function (b) {
      b.addEventListener("click", function () {
        prefs = Object.assign({}, DEFAULTS, { lang: prefs.lang }); save(prefs); apply(); syncControls();
      });
    });

    // Bascule de langue dans l'en-tête
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(prefs.lang === "fr" ? "en" : "fr"); syncControls(); });
    });

    syncControls();
  }

  /* ---- TERMINAL « live » + commandes cliquables -------------------------- */
  function escapeHTML(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function getTerminal(cmd) {
    var sel = cmd.getAttribute("data-term");
    if (sel) { var t = document.querySelector(sel); if (t) return t; }
    return document.querySelector("[data-terminal]");
  }

  function typeInto(screen, text, done) {
    var motionOff = root.getAttribute("data-motion") === "off";
    var line = document.createElement("div");
    line.className = "term-line term-line--cmd";
    var prompt = '<span class="p">$</span> ';
    screen.appendChild(line);
    if (motionOff) {
      line.innerHTML = prompt + escapeHTML(text);
      screen.scrollTop = screen.scrollHeight; done();
      return;
    }
    var i = 0, cur = '<span class="term-cursor"></span>';
    line.innerHTML = prompt + cur;
    var iv = setInterval(function () {
      i++;
      line.innerHTML = prompt + escapeHTML(text.slice(0, i)) + cur;
      screen.scrollTop = screen.scrollHeight;
      if (i >= text.length) { clearInterval(iv); line.innerHTML = prompt + escapeHTML(text); setTimeout(done, 160); }
    }, 22);
  }

  function revealOutput(screen, html, done) {
    var motionOff = root.getAttribute("data-motion") === "off";
    var wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    var nodes = Array.prototype.slice.call(wrap.children);
    if (!nodes.length) { done && done(); return; }
    var idx = 0;
    function step() {
      if (idx >= nodes.length) { done && done(); return; }
      screen.appendChild(nodes[idx]);
      screen.scrollTop = screen.scrollHeight;
      idx++;
      if (motionOff) step(); else setTimeout(step, 90);
    }
    step();
  }

  function runCommand(cmd) {
    var term = getTerminal(cmd); if (!term) return;
    var screen = term.querySelector(".terminal__screen");
    var text = cmd.getAttribute("data-cmd") || (cmd.querySelector("code") ? cmd.querySelector("code").textContent : "");
    var tpl = cmd.parentNode.querySelector(".cmd-out") || (cmd.nextElementSibling && cmd.nextElementSibling.matches(".cmd-out") ? cmd.nextElementSibling : null);
    var out = tpl ? tpl.innerHTML : "";
    if (cmd.getAttribute("data-running") === "true") return;
    cmd.setAttribute("data-running", "true");
    typeInto(screen, text, function () {
      revealOutput(screen, out, function () {
        cmd.setAttribute("data-done", "true");
        cmd.removeAttribute("data-running");
      });
    });
  }

  function wireTerminals() {
    document.querySelectorAll(".cmd").forEach(function (cmd) {
      cmd.setAttribute("role", "button"); cmd.setAttribute("tabindex", "0");
      cmd.addEventListener("click", function () { runCommand(cmd); });
      cmd.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); runCommand(cmd); } });
    });
    document.querySelectorAll("[data-term-replay]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var term = btn.closest(".terminal");
        var screen = term.querySelector(".terminal__screen");
        var initial = term.querySelector("template.term-initial");
        screen.innerHTML = initial ? initial.innerHTML : "";
        screen.scrollTop = 0;
        document.querySelectorAll('.cmd[data-term="#' + term.id + '"], .cmd').forEach(function (c) {
          if (!c.getAttribute("data-term") || c.getAttribute("data-term") === "#" + term.id) {
            c.removeAttribute("data-done");
          }
        });
      });
    });
    // initialise chaque écran avec son contenu initial
    document.querySelectorAll(".terminal").forEach(function (term) {
      var screen = term.querySelector(".terminal__screen");
      var initial = term.querySelector("template.term-initial");
      if (initial && !screen.children.length) screen.innerHTML = initial.innerHTML;
    });
  }

  /* ---- THÈME du terminal (clair/sombre) — local au terminal, persistant ---- */
  var TERM_THEME_KEY = "site-astro-term-theme-v1";
  function readTermTheme() { try { return localStorage.getItem(TERM_THEME_KEY) || "dark"; } catch (e) { return "dark"; } }
  function applyTermTheme(theme) {
    document.querySelectorAll(".terminal").forEach(function (t) {
      if (theme === "light") t.setAttribute("data-term-theme", "light");
      else t.removeAttribute("data-term-theme");
    });
    document.querySelectorAll("[data-term-theme-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(theme === "light"));
      b.setAttribute("aria-label", theme === "light"
        ? "Thème du terminal : clair — basculer en sombre"
        : "Thème du terminal : sombre — basculer en clair");
    });
  }
  function wireTermThemes() {
    applyTermTheme(readTermTheme());
    document.querySelectorAll("[data-term-theme-btn]").forEach(function (b) {
      b.addEventListener("click", function () {
        var next = readTermTheme() === "light" ? "dark" : "light";
        try { localStorage.setItem(TERM_THEME_KEY, next); } catch (e) {}
        applyTermTheme(next);
      });
    });
  }

  /* ---- SAISIE DIRECTE de commandes (interpréteur simulé) ----------------- */
  var PID_OUT =
    '<div class="term-line term-line--out">PID   USER     TIME  COMMAND</div>' +
    '<div class="term-line term-line--out">    1 root      0:00 ps -ef</div>' +
    '<div class="term-line term-line--ok"><span class="tag">note</span><span data-lang="fr">un seul processus, PID 1 — l\'hôte est invisible.</span><span data-lang="en">a single process, PID 1 — the host is invisible.</span></div>';
  var MEM_OUT =
    '<div class="term-line term-line--out">              total    used    free</div>' +
    '<div class="term-line term-line--out">Mem:             64       3      61</div>' +
    '<div class="term-line term-line--warn"><span class="tag"><span data-lang="fr">limite</span><span data-lang="en">limit</span></span><span data-lang="fr">mémoire plafonnée à 64 Mo par le cgroup.</span><span data-lang="en">memory capped at 64 MB by the cgroup.</span></div>';

  function outLine(cls, fr, en) {
    return '<div class="term-line ' + cls + '">' +
      (fr != null ? '<span data-lang="fr">' + fr + '</span>' : '') +
      (en != null ? '<span data-lang="en">' + en + '</span>' : '') + '</div>';
  }

  function termInterpret(raw) {
    var cmd = raw.trim().replace(/\s+/g, " ");
    if (cmd === "") return { ignore: true };
    if (cmd === "clear" || cmd === "cls") return { clear: true };
    var M = {
      "help":
        outLine("term-line--out", "commandes disponibles :", "available commands:") +
        '<div class="term-line term-line--out">help · clear · ls · pwd · whoami · uname -r</div>' +
        '<div class="term-line term-line--out">podman ps · podman images · cat /etc/os-release</div>' +
        '<div class="term-line term-line--out">podman run --rm alpine ps -ef</div>' +
        '<div class="term-line term-line--out">podman run --rm -m 64m alpine free -m</div>',
      "ls": '<div class="term-line term-line--out">Containerfile  app/  README.md</div>',
      "ls -l":
        '<div class="term-line term-line--out">-rw-r--r-- 1 dev dev  214 Containerfile</div>' +
        '<div class="term-line term-line--out">drwxr-xr-x 2 dev dev 4096 app</div>' +
        '<div class="term-line term-line--out">-rw-r--r-- 1 dev dev  118 README.md</div>',
      "pwd": '<div class="term-line term-line--out">/home/dev/atelier</div>',
      "whoami": '<div class="term-line term-line--out">dev</div>',
      "id": '<div class="term-line term-line--out">uid=1000(dev) gid=1000(dev) groups=1000(dev)</div>',
      "uname -r":
        '<div class="term-line term-line--out">6.8.0-1-amd64</div>' +
        outLine("term-line--ok", '<span class="tag">note</span>un seul noyau, partagé par tous les conteneurs.', '<span class="tag">note</span>a single kernel, shared by every container.'),
      "podman ps":
        '<div class="term-line term-line--out">NAMES  STATUS</div>' +
        '<div class="term-line term-line--out">web    Up 2 minutes</div>' +
        '<div class="term-line term-line--out">db     Up 2 minutes</div>',
      "podman images":
        '<div class="term-line term-line--out">REPOSITORY   TAG   SIZE</div>' +
        '<div class="term-line term-line--out">alpine       3.20  7.4 MB</div>' +
        '<div class="term-line term-line--out">demo         1     12 MB</div>',
      "podman run --rm alpine ps -ef": PID_OUT,
      "podman run --rm -m 64m alpine free -m": MEM_OUT,
      "cat /etc/os-release":
        '<div class="term-line term-line--out">NAME="Alpine Linux"</div>' +
        '<div class="term-line term-line--out">VERSION_ID=3.20.0</div>'
    };
    if (M[cmd]) return { html: M[cmd] };
    return {
      html:
        outLine("term-line--warn",
          '<span class="tag">erreur</span>bash : ' + escapeHTML(cmd.split(" ")[0]) + " : commande introuvable",
          '<span class="tag">error</span>bash: ' + escapeHTML(cmd.split(" ")[0]) + ": command not found") +
        outLine("term-line--out", 'tapez <strong>help</strong> pour la liste.', 'type <strong>help</strong> for the list.')
    };
  }

  function wireTermInput() {
    document.querySelectorAll(".terminal").forEach(function (term) {
      var form = term.querySelector("[data-term-input]");
      if (!form) return;
      var input = form.querySelector("input");
      var screen = term.querySelector(".terminal__screen");
      var hist = [], hi = 0;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = input.value;
        var res = termInterpret(v);
        if (res.ignore) { input.value = ""; return; }
        var line = document.createElement("div");
        line.className = "term-line term-line--cmd";
        line.innerHTML = '<span class="p">$</span> ' + escapeHTML(v.trim());
        screen.appendChild(line);
        hist.push(v.trim()); hi = hist.length;
        input.value = "";
        if (res.clear) { screen.innerHTML = ""; screen.scrollTop = 0; return; }
        revealOutput(screen, res.html, function () { screen.scrollTop = screen.scrollHeight; });
        screen.scrollTop = screen.scrollHeight;
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowUp") {
          if (hi > 0) { hi--; input.value = hist[hi]; e.preventDefault(); moveCaretEnd(input); }
        } else if (e.key === "ArrowDown") {
          if (hi < hist.length - 1) { hi++; input.value = hist[hi]; }
          else { hi = hist.length; input.value = ""; }
          e.preventDefault();
        }
      });
      screen.addEventListener("click", function (e) {
        if (window.getSelection && String(window.getSelection()).length) return;
        if (e.target.closest("a, button, .cmd")) return;
        input.focus();
      });
    });
  }
  function moveCaretEnd(el) { var v = el.value; el.value = ""; el.value = v; }

  /* ---- GLISSER le terminal à gauche/droite (grip), persistant ------------ */
  var SIDE_KEY = "site-astro-term-side-v1";
  function readSide() { try { return localStorage.getItem(SIDE_KEY) || "right"; } catch (e) { return "right"; } }
  function setCourseSide(course, side) {
    if (side === "left") course.setAttribute("data-term-side", "left");
    else course.removeAttribute("data-term-side");
  }
  /* ===== POO : DragWidget (classe mère) — suit le curseur, swap au lâcher =====
     Mutualise toute la mécanique de drag. Sous-classes :
     - CoursePane : terminal/colonne d'un cours (persistant + zones de dépôt)
     - SwapIsland : îlot générique [data-swap] (inverse l'ordre des 2 enfants) */
  function DragWidget(grip, box, pane) {
    this.grip = grip; this.box = box; this.pane = pane;
    this.dragging = false; this.moved = false; this.sx = 0; this.sy = 0;
    var self = this;
    this._move = function (e) { self._onMove(e); };
    this._up = function (e) { self._onUp(e); };
    grip.addEventListener("pointerdown", function (e) { self._onDown(e); });
    grip.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); self.onToggle(); } });
    grip.addEventListener("dragstart", function (e) { e.preventDefault(); }); // neutralise le drag natif (liens/images)
  }
  DragWidget.prototype.followY = 0.18;
  DragWidget.prototype.ignoreSel = "button, a, input, select, textarea";
  DragWidget.prototype._leftHalf = function (x) { var r = this.box.getBoundingClientRect(); return x < r.left + r.width / 2; };
  DragWidget.prototype._isFirst = function () { return [].indexOf.call(this.box.children, this.pane) === 0; };
  DragWidget.prototype._onDown = function (e) {
    if (window.innerWidth <= 980) return;
    // Ne pas démarrer si un grip plus interne (imbriqué) capte l'événement
    var g = e.target.closest("[data-swap-grip], [data-pane-grip]");
    if (g && g !== this.grip) return;
    if (this.ignoreSel && e.target.closest(this.ignoreSel)) return;
    this.dragging = true; this.moved = false; this.sx = e.clientX; this.sy = e.clientY;
    this._pid = e.pointerId;
    window.addEventListener("pointermove", this._move); window.addEventListener("pointerup", this._up);
    // capture du pointeur différée (au franchissement du seuil) pour ne pas détourner les clics
  };
  DragWidget.prototype._onMove = function (e) {
    if (!this.dragging) return;
    var dx = e.clientX - this.sx, dy = e.clientY - this.sy;
    if (!this.moved && Math.hypot(dx, dy) < 5) return;
    this.moved = true; this.pane.setAttribute("data-dragging", "true"); this.box.classList.add("is-dragging");
    try { if (this._pid != null) this.grip.setPointerCapture(this._pid); } catch (err) {}
    this.pane.style.transform = "translate(" + dx + "px," + (dy * this.followY).toFixed(1) + "px) scale(0.99)";
    this.onMove(this._leftHalf(e.clientX)); e.preventDefault();
  };
  DragWidget.prototype._onUp = function (e) {
    window.removeEventListener("pointermove", this._move); window.removeEventListener("pointerup", this._up);
    try { if (this._pid != null) this.grip.releasePointerCapture(this._pid); } catch (err) {}
    this.pane.style.transform = ""; this.pane.removeAttribute("data-dragging"); this.box.classList.remove("is-dragging");
    if (this.moved) this.onDrop(this._leftHalf(e.clientX));
    this.onMove(null); this.dragging = false; this.moved = false;
  };
  DragWidget.prototype.onMove = function () {};   // hook survol
  DragWidget.prototype.onDrop = function () {};   // abstrait
  DragWidget.prototype.onToggle = function () {}; // abstrait (clavier)

  function CoursePane(grip, course, pane, zones) {
    DragWidget.call(this, grip, course, pane);
    this.isTerminal = pane.classList.contains("course__aside");
    this.zones = zones;
  }
  CoursePane.prototype = Object.create(DragWidget.prototype);
  CoursePane.prototype.constructor = CoursePane;
  CoursePane.prototype._side = function (leftHalf) { var p = leftHalf ? "left" : "right"; return this.isTerminal ? p : (p === "left" ? "right" : "left"); };
  CoursePane.prototype.onMove = function (leftHalf) { var s = leftHalf == null ? null : this._side(leftHalf); this.zones.l.classList.toggle("active", s === "left"); this.zones.r.classList.toggle("active", s === "right"); };
  CoursePane.prototype.onDrop = function (leftHalf) { var s = this._side(leftHalf); try { localStorage.setItem(SIDE_KEY, s); } catch (e) {} setCourseSide(this.box, s); };
  CoursePane.prototype.onToggle = function () { var cur = this.box.getAttribute("data-term-side") === "left" ? "left" : "right"; var s = cur === "left" ? "right" : "left"; try { localStorage.setItem(SIDE_KEY, s); } catch (e) {} setCourseSide(this.box, s); };

  function SwapIsland(grip, box, pane) { DragWidget.call(this, grip, box, pane); }
  SwapIsland.prototype = Object.create(DragWidget.prototype);
  SwapIsland.prototype.constructor = SwapIsland;
  SwapIsland.prototype.followY = 0;
  SwapIsland.prototype.onDrop = function (leftHalf) { if (this._isFirst() !== leftHalf) this.box.setAttribute("data-swapped", ""); else this.box.removeAttribute("data-swapped"); };
  SwapIsland.prototype.onToggle = function () { this.box.toggleAttribute("data-swapped"); };

  function wireTermDrag() {
    document.querySelectorAll(".course").forEach(function (course) {
      setCourseSide(course, readSide());
      var grips = course.querySelectorAll("[data-pane-grip]");
      if (!grips.length) return;
      var zl = document.createElement("div"); zl.className = "course__dropzone left"; zl.setAttribute("aria-hidden", "true");
      var zr = document.createElement("div"); zr.className = "course__dropzone right"; zr.setAttribute("aria-hidden", "true");
      course.appendChild(zl); course.appendChild(zr);
      var zones = { l: zl, r: zr };
      grips.forEach(function (grip) {
        var pane = grip.closest(".course__aside, .course__reading");
        if (pane) new CoursePane(grip, course, pane, zones);
      });
    });
  }

  /* ---- REDIMENSIONNER lecture / terminal (splitter), persistant ---------- */
  var COL_KEY = "site-astro-term-col-v1";
  function wireTermResize() {
    var saved = null;
    try { saved = localStorage.getItem(COL_KEY); } catch (e) {}
    document.querySelectorAll(".course").forEach(function (course) {
      if (saved) course.style.setProperty("--term-col", saved);
      var rz = course.querySelector(".course__resizer");
      if (!rz) return;
      var dragging = false;
      function widthFor(x) {
        var r = course.getBoundingClientRect();
        var side = course.getAttribute("data-term-side") === "left" ? "left" : "right";
        var w = side === "left" ? (x - r.left) : (r.right - x);
        return Math.max(320, Math.min(r.width * 0.56, w));
      }
      function move(e) { if (!dragging) return; var w = widthFor(e.clientX) + "px"; course.style.setProperty("--term-col", w); e.preventDefault(); }
      function up() {
        dragging = false; course.classList.remove("rz-active"); document.body.style.userSelect = "";
        window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
        try { localStorage.setItem(COL_KEY, course.style.getPropertyValue("--term-col")); } catch (e) {}
      }
      rz.addEventListener("pointerdown", function (e) {
        if (window.innerWidth <= 980) return;
        dragging = true; course.classList.add("rz-active"); document.body.style.userSelect = "none";
        window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
        e.preventDefault();
      });
      rz.addEventListener("keydown", function (e) {
        var r = course.getBoundingClientRect();
        var cur = parseFloat(getComputedStyle(course.querySelector(".course__aside")).width) || 440;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          var side = course.getAttribute("data-term-side") === "left" ? "left" : "right";
          var dir = (e.key === "ArrowLeft" ? -1 : 1) * (side === "left" ? -1 : 1);
          var w = Math.max(320, Math.min(r.width * 0.56, cur + dir * 24)) + "px";
          course.style.setProperty("--term-col", w);
          try { localStorage.setItem(COL_KEY, w); } catch (err) {}
          e.preventDefault();
        }
      });
    });
  }

  /* ---- EXERCICE : verrou de la solution tant que la réponse est vide ----- */
  function answerGateOn() { return document.documentElement.getAttribute("data-require-answer") !== "off"; }
  function refreshExercise(ex) {
    var mode = ex.getAttribute("data-gate-mode"); // "on" | "off" | null → suit le réglage global
    var gate = mode === "on" ? true : mode === "off" ? false : answerGateOn();
    var field = ex.querySelector("[data-exercise-answer] textarea, [data-exercise-answer] input");
    var details = ex.querySelector(".exercise__solution");
    if (!details) return;
    var summary = details.querySelector("summary");
    var answered = field ? field.value.trim().length >= 1 : true;
    var locked = gate && !answered;
    ex.setAttribute("data-gate", gate ? "on" : "off");
    ex.setAttribute("data-answered", String(answered));
    ex.setAttribute("data-locked", String(locked));
    if (summary) summary.setAttribute("aria-disabled", String(locked));
    if (locked && details.open) details.open = false;
  }
  function wireExercises() {
    var list = document.querySelectorAll(".exercise");
    list.forEach(function (ex) {
      var field = ex.querySelector("[data-exercise-answer] textarea, [data-exercise-answer] input");
      var details = ex.querySelector(".exercise__solution");
      if (!details) return;
      var summary = details.querySelector("summary");
      refreshExercise(ex);
      if (field) field.addEventListener("input", function () { refreshExercise(ex); });
      if (summary) {
        summary.addEventListener("click", function (e) {
          if (ex.getAttribute("data-locked") === "true") { e.preventDefault(); if (field) field.focus(); }
        });
        summary.addEventListener("keydown", function (e) {
          if ((e.key === "Enter" || e.key === " ") && ex.getAttribute("data-locked") === "true") { e.preventDefault(); if (field) field.focus(); }
        });
      }
    });
    // Réagit aux changements du Tweak « exiger une réponse »
    document.addEventListener("sa:require-answer", function () { list.forEach(refreshExercise); });
  }

  /* ---- BARRE DE PROGRESSION de lecture ----------------------------------- */
  function wireReadingProgress() {
    var bar = document.querySelector("[data-read-progress]");
    if (!bar) return;
    var article = document.querySelector(".course__reading") || document.querySelector("main");
    function update() {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var scrolled = -rect.top;
      var p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : (rect.top <= 0 ? 1 : 0);
      bar.style.width = (p * 100).toFixed(1) + "%";
      bar.parentNode.setAttribute("aria-valuenow", Math.round(p * 100));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---- KaTeX ------------------------------------------------------------- */
  function renderMath() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    }
  }

  /* ---- EFFET PLONGÉE — fond qui s'assombrit au scroll ------------------- */
  function wireDepth() {
    var body = document.body;
    if (!body.hasAttribute("data-depth-capable")) return;
    function update() {
      var motionOff = root.getAttribute("data-motion") === "off";
      if (!body.hasAttribute("data-depth-scroll")) { root.style.setProperty("--depth", "0"); return; }
      if (motionOff) { root.style.setProperty("--depth", "0.16"); return; }
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      // Easing sinusoïdal : descente douce (départ et fin atténués) → moins brusque
      var eased = 0.5 - 0.5 * Math.cos(p * Math.PI);
      root.style.setProperty("--depth", eased.toFixed(3));
    }
    window.__saUpdateDepth = update;
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---- RAIL de largeur globale (bord droit du contenu) -------------------
     Même vocabulaire visuel que le splitter de cours : filet au repos,
     filet accent + poignée .knob (composant partagé) à l'approche.
     Glisser = ajuster ; clic = largeur par défaut ; ←/→ au clavier. */
  function wireWidthGrip() {
    var grip = document.createElement("div");
    grip.className = "width-rail";
    grip.setAttribute("role", "slider");
    grip.setAttribute("tabindex", "0");
    grip.setAttribute("aria-label", "Largeur du site — glisser pour ajuster, cliquer pour réinitialiser, flèches gauche/droite");
    grip.setAttribute("aria-valuemin", "60");
    grip.setAttribute("aria-valuemax", "160");
    grip.innerHTML = '<span class="knob" aria-hidden="true"><i></i><i></i></span><span class="width-rail__tip"><span data-lang="fr">Glisser pour ajuster · cliquer : largeur par défaut</span><span data-lang="en">Drag to adjust · click: default width</span></span>';
    document.body.appendChild(grip);
    function contentPx() { return Math.min((prefs.width || 72) * 16, window.innerWidth * 0.98); }
    function reposition() {
      grip.style.left = Math.round(window.innerWidth / 2 + contentPx() / 2 - 9) + "px";
      grip.setAttribute("aria-valuenow", String(prefs.width || 72));
    }
    window.__saReposWidthGrip = reposition;
    reposition();
    window.addEventListener("resize", reposition);
    var dragging = false, moved = false, sx = 0;
    function setW(rem) { prefs.width = Math.max(60, Math.min(160, rem)); save(prefs); apply(); syncControls(); }
    grip.addEventListener("pointerdown", function (e) {
      dragging = true; moved = false; sx = e.clientX; grip.setAttribute("data-active", "true");
      window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); e.preventDefault();
    });
    function mv(e) { if (!dragging) return; if (Math.abs(e.clientX - sx) > 4) moved = true; if (!moved) return; var half = Math.abs(e.clientX - window.innerWidth / 2); setW(Math.round((half * 2 / 16) / 2) * 2); e.preventDefault(); }
    function up() { dragging = false; grip.removeAttribute("data-active"); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); if (!moved) setW(DEFAULTS.width); }
    grip.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowLeft" ? -4 : e.key === "ArrowRight" ? 4 : 0;
      if (d) { setW((prefs.width || 72) + d); e.preventDefault(); }
    });
  }

  /* ---- SWAP générique : déplacer un îlot à gauche/droite (page Système) --- */
  function wireSwap() {
    document.querySelectorAll("[data-swap]").forEach(function (box) {
      box.querySelectorAll("[data-swap-grip]").forEach(function (grip) {
        // Ne lier qu'aux grips qui appartiennent DIRECTEMENT à ce conteneur
        // (pas à ceux imbriqués dans un autre [data-swap]).
        if (grip.closest("[data-swap]") !== box) return;
        var pane = grip; while (pane && pane.parentNode !== box) pane = pane.parentNode;
        if (pane) {
          var w = new SwapIsland(grip, box, pane);
          if (grip.hasAttribute("data-grip-loose")) w.ignoreSel = "button, input, select, textarea";
          else if (grip.hasAttribute("data-grip-strict")) w.ignoreSel = "button, a, input, select, textarea, p, h1, h2, h3, h4, h5, li, code, pre, summary, mark, label, dt, dd, span, output, .terminal, .slides";
        }
      });
    });
  }

  /* ---- SOMMAIRE LATÉRAL (.toc) — comportement du composant partagé --------
     Défini UNE FOIS ici ; les pages ne font qu'instancier le markup .toc-layout/.toc
     (voir components.css). Deux responsabilités :
     1. Curseur : pointeur uniquement sur le texte des liens (.lbl) — le reste
        du sommaire est une poignée de drag (grab), héritée de SwapIsland.
     2. Double mobile : génère <details class="toc-m"> depuis le MÊME <ol>
        (source unique — aucune duplication de sommaire dans les pages). */
  function wireTocs() {
    document.querySelectorAll(".toc").forEach(function (toc) {
      if (toc.hasAttribute("data-swap-grip")) {
        toc.querySelectorAll("a").forEach(function (a) {
          if (a.querySelector(".lbl")) return;
          var lbl = document.createElement("span"); lbl.className = "lbl";
          while (a.firstChild) lbl.appendChild(a.firstChild);
          a.appendChild(lbl);
        });
      }
      if (toc.hasAttribute("data-toc-no-mobile")) return;
      var layout = toc.closest(".toc-layout");
      var list = toc.querySelector("ol, ul");
      if (!layout || !list) return;
      var prev = layout.previousElementSibling;
      if (prev && prev.classList && prev.classList.contains("toc-m")) return;
      var det = document.createElement("details");
      det.className = "toc-m";
      var sum = document.createElement("summary");
      sum.innerHTML = '<i data-lucide="list" aria-hidden="true"></i><span data-lang="fr">Sommaire</span><span data-lang="en">Contents</span>';
      det.appendChild(sum);
      det.appendChild(list.cloneNode(true));
      det.addEventListener("click", function (e) { if (e.target.closest("a")) det.open = false; });
      layout.parentNode.insertBefore(det, layout);
    });
    // 3. Scrollspy : signale la section en cours de lecture (aria-current)
    document.querySelectorAll(".toc").forEach(function (toc) {
      var links = [].filter.call(toc.querySelectorAll("a"), function (a) {
        var h = a.getAttribute("href"); return h && h.charAt(0) === "#";
      });
      var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
      if (!links.length || targets.some(function (t) { return !t; })) return;
      var ticking = false;
      function spy() {
        ticking = false;
        var cur = -1;
        for (var i = 0; i < targets.length; i++) { if (targets[i].getBoundingClientRect().top <= 120) cur = i; }
        links.forEach(function (a, k) { if (k === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      }
      window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
      spy();
    });
  }

  /* ---- SLUG partagé (ancres ↔ index de recherche — MÊME algorithme que le
     générateur de scripts/site-data.js, ne pas diverger) ------------------- */
  function slugSA(t) {
    return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
  }
  function frTextOf(el) {
    var c = el.cloneNode(true);
    [].forEach.call(c.querySelectorAll('[data-lang="en"], svg, i, button'), function (n) { n.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim();
  }

  /* ---- ANCRES COPIABLES — « # » au survol des titres --------------------- */
  function wireAnchors() {
    var used = {};
    [].forEach.call(document.querySelectorAll("main h2, main h3"), function (h) {
      if (h.closest(".slides, .exercise, .escape, .terminal, .a11y-panel, .cmdk")) return;
      var sec = h.closest("section[id]");
      var id = sec ? sec.id : h.id;
      if (!id) {
        id = slugSA(frTextOf(h));
        while (used[id] || document.getElementById(id)) id += "-2";
        h.id = id;
      }
      used[id] = true;
      if (h.querySelector(".h-anchor")) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "h-anchor"; b.textContent = "#";
      b.setAttribute("aria-label", "Copier le lien vers cette section");
      b.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#" + id;
        function fb() {
          b.textContent = "✓"; b.setAttribute("data-copied", "true");
          setTimeout(function () { b.textContent = "#"; b.removeAttribute("data-copied"); }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(fb, fb); else fb();
        try { history.replaceState(null, "", "#" + id); } catch (e) {}
      });
      h.appendChild(b);
    });
  }

  /* ---- REPRISE DE LECTURE — position mémorisée par page ------------------ */
  var POS_KEY = "site-astro-pos-v1";
  function wireResume() {
    var path = location.pathname.split("/").pop() || "index.html";
    var store = {};
    try { store = JSON.parse(localStorage.getItem(POS_KEY) || "{}"); } catch (e) {}
    var t = null;
    window.addEventListener("scroll", function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (max < window.innerHeight) return; /* page courte : inutile */
        store[path] = { y: Math.round(window.scrollY), t: Date.now() };
        var keys = Object.keys(store);
        if (keys.length > 12) { keys.sort(function (a, b) { return store[a].t - store[b].t; }); delete store[keys[0]]; }
        try { localStorage.setItem(POS_KEY, JSON.stringify(store)); } catch (e) {}
      }, 500);
    }, { passive: true });
    var saved = store[path];
    var max0 = document.documentElement.scrollHeight - window.innerHeight;
    if (!saved || saved.y < 900 || window.scrollY > 200 || location.hash || max0 <= 0) return;
    var chip = document.createElement("div");
    chip.className = "resume-chip"; chip.setAttribute("role", "status");
    chip.innerHTML = '<span><span data-lang="fr">Reprendre la lecture ?</span><span data-lang="en">Resume reading?</span> <span class="pct">' + Math.min(99, Math.round(saved.y / max0 * 100)) + '%</span></span>' +
      '<button class="resume-chip__go" type="button"><span data-lang="fr">Reprendre</span><span data-lang="en">Resume</span></button>' +
      '<button class="resume-chip__x" type="button" aria-label="Ignorer">✕</button>';
    document.body.appendChild(chip);
    requestAnimationFrame(function () { chip.setAttribute("data-show", "true"); });
    var gone = false;
    function hide() { if (gone) return; gone = true; chip.removeAttribute("data-show"); setTimeout(function () { chip.remove(); }, 420); }
    chip.querySelector(".resume-chip__go").addEventListener("click", function () {
      var off = document.documentElement.getAttribute("data-motion") === "off" ||
        (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
      window.scrollTo({ top: saved.y, behavior: off ? "auto" : "smooth" });
      hide();
    });
    chip.querySelector(".resume-chip__x").addEventListener("click", hide);
    setTimeout(hide, 12000);
    window.addEventListener("scroll", function onSc() {
      if (window.scrollY > 400) { hide(); window.removeEventListener("scroll", onSc); }
    }, { passive: true });
  }

  /* ---- RECHERCHE LOCALE — palette Ctrl/Cmd+K, sans serveur ---------------
     Index généré dans scripts/site-data.js (window.SA_SEARCH_INDEX). */
  function wireSearch() {
    var INDEX = window.SA_SEARCH_INDEX || [];
    if (!INDEX.length) return;
    var root = null, input, list, items = [], sel = 0, prevFocus = null;
    function norm(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
    function curLang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "fr"; }
    function build() {
      root = document.createElement("div");
      root.className = "cmdk";
      root.innerHTML = '<div class="cmdk__backdrop"></div>' +
        '<div class="cmdk__panel" role="dialog" aria-modal="true" aria-label="Recherche sur le site">' +
        '<div class="cmdk__input"><span class="p" aria-hidden="true">❯</span>' +
        '<input type="text" autocomplete="off" spellcheck="false" aria-label="Rechercher une section">' +
        '<kbd>Esc</kbd></div><ul class="cmdk__list" role="listbox"></ul></div>';
      document.body.appendChild(root);
      input = root.querySelector("input"); list = root.querySelector(".cmdk__list");
      input.setAttribute("placeholder", curLang() === "en" ? "Search a section…" : "Rechercher une section…");
      root.querySelector(".cmdk__backdrop").addEventListener("click", close);
      input.addEventListener("input", function () { render(input.value); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { move(1); e.preventDefault(); }
        else if (e.key === "ArrowUp") { move(-1); e.preventDefault(); }
        else if (e.key === "Enter") { var a = items[sel]; if (a) a.click(); }
      });
    }
    function render(q) {
      var L = curLang(), nq = norm(q || "");
      var res = INDEX.filter(function (en) { return !nq || norm(en[L] + " " + en.p).indexOf(nq) !== -1; }).slice(0, 14);
      list.innerHTML = ""; items = []; sel = 0;
      var lastPage = null;
      res.forEach(function (en) {
        if (en.p !== lastPage) {
          var g = document.createElement("li"); g.className = "cmdk__group"; g.textContent = en.p;
          list.appendChild(g); lastPage = en.p;
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "cmdk__item"; a.setAttribute("role", "option");
        a.href = en.page + (en.hash ? "#" + en.hash : "");
        a.textContent = en[L];
        a.addEventListener("click", close);
        li.appendChild(a); list.appendChild(li); items.push(a);
      });
      if (!res.length) {
        var em = document.createElement("li"); em.className = "cmdk__empty";
        em.textContent = L === "en" ? "No results" : "Aucun résultat";
        list.appendChild(em);
      }
      mark();
    }
    function mark() {
      items.forEach(function (a, k) { a.setAttribute("aria-selected", String(k === sel)); });
      var c = items[sel];
      if (c) { /* maintient l'élément sélectionné visible (sans scrollIntoView) */
        var r = c.getBoundingClientRect(), lr = list.getBoundingClientRect();
        if (r.bottom > lr.bottom) list.scrollTop += r.bottom - lr.bottom;
        if (r.top < lr.top) list.scrollTop -= lr.top - r.top;
      }
    }
    function move(d) { if (!items.length) return; sel = (sel + d + items.length) % items.length; mark(); }
    function open() {
      if (!root) build();
      prevFocus = document.activeElement;
      input.setAttribute("placeholder", curLang() === "en" ? "Search a section…" : "Rechercher une section…");
      root.setAttribute("data-open", "true");
      input.value = ""; render(""); input.focus();
    }
    function close() {
      if (root) root.removeAttribute("data-open");
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
    }
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (root && root.getAttribute("data-open") === "true") close(); else open();
      } else if (e.key === "Escape" && root && root.getAttribute("data-open") === "true") { close(); e.preventDefault(); }
    });
    window.__saOpenSearch = open;
  }

  /* ---- GLOSSAIRE — définitions en popover sur <dfn data-gloss> -----------
     Termes définis une fois dans scripts/site-data.js (window.SA_GLOSSARY). */
  function wireGloss() {
    var G = window.SA_GLOSSARY || {};
    var pop = null, current = null, hideT = null;
    function curLang() { return document.documentElement.getAttribute("lang") === "en" ? "en" : "fr"; }
    function ensure() {
      if (pop) return;
      pop = document.createElement("div");
      pop.className = "gloss-pop"; pop.id = "gloss-pop"; pop.setAttribute("role", "tooltip");
      document.body.appendChild(pop);
      pop.addEventListener("mouseenter", function () { clearTimeout(hideT); });
      pop.addEventListener("mouseleave", scheduleHide);
    }
    function show(d) {
      var key = d.getAttribute("data-gloss");
      var def = G[key]; if (!def) return;
      ensure(); clearTimeout(hideT); current = d;
      pop.innerHTML = '<span class="gloss-pop__term"></span><span class="gloss-pop__def"></span>';
      pop.querySelector(".gloss-pop__term").textContent = key;
      pop.querySelector(".gloss-pop__def").textContent = def[curLang()] || def.fr;
      pop.setAttribute("data-show", "true");
      var r = d.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
      var x = Math.max(8, Math.min(window.innerWidth - pw - 8, r.left));
      var y = (r.bottom + 10 + ph < window.innerHeight) ? r.bottom + 8 : r.top - ph - 8;
      pop.style.left = Math.round(x + window.scrollX) + "px";
      pop.style.top = Math.round(y + window.scrollY) + "px";
      d.setAttribute("aria-describedby", "gloss-pop");
    }
    function scheduleHide() { clearTimeout(hideT); hideT = setTimeout(hide, 220); }
    function hide() {
      if (pop) pop.removeAttribute("data-show");
      if (current) current.removeAttribute("aria-describedby");
      current = null;
    }
    [].forEach.call(document.querySelectorAll("dfn"), function (d) {
      var key = d.getAttribute("data-gloss") || d.textContent.trim();
      if (!G[key]) return;
      if (!d.hasAttribute("data-gloss")) d.setAttribute("data-gloss", key);
      d.setAttribute("tabindex", "0");
      d.addEventListener("mouseenter", function () { show(d); });
      d.addEventListener("mouseleave", scheduleHide);
      d.addEventListener("focus", function () { show(d); });
      d.addEventListener("blur", scheduleHide);
      d.addEventListener("click", function () { if (current === d) hide(); else show(d); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  }

  /* ---- DIAPORAMA (slides) ------------------------------------------------ */
  function wireSlides() {
    document.querySelectorAll("[data-slides]").forEach(function (box) {
      var track = box.querySelector("[data-slides-track]");
      if (!track) return;
      var slides = [].slice.call(track.children);
      var prev = box.querySelector("[data-slides-prev]");
      var next = box.querySelector("[data-slides-next]");
      var dotsWrap = box.querySelector("[data-slides-dots]");
      var counter = box.querySelector("[data-slides-counter]");
      var i = 0;
      // Outils injectés : vue étendue + plein écran
      var head = box.querySelector(".slides__head");
      if (head && !head.querySelector(".slides__tools")) {
        var tools = document.createElement("span");
        tools.className = "slides__tools";
        tools.innerHTML =
          '<button class="slides__tool" data-slides-expand type="button" aria-pressed="false" aria-label="Vue étendue" title="Vue étendue"><i data-lucide="maximize-2" aria-hidden="true"></i></button>' +
          '<button class="slides__tool" data-slides-fs type="button" aria-label="Plein écran" title="Plein écran"><i data-lucide="expand" aria-hidden="true"></i></button>';
        head.appendChild(tools);
        tools.querySelector("[data-slides-expand]").addEventListener("click", function () {
          var on = box.classList.toggle("slides--wide");
          this.setAttribute("aria-pressed", String(on));
          if (on) box.focus();
        });
        var fsBtn = tools.querySelector("[data-slides-fs]");
        fsBtn.addEventListener("click", function () {
          var on = box.classList.toggle("slides--fs");
          fsBtn.setAttribute("aria-pressed", String(on));
          if (on) {
            box.focus();
            var req = box.requestFullscreen || box.webkitRequestFullscreen;
            if (req) { try { var r = req.call(box); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
          } else {
            var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
            if (fsEl === box) { var ex = document.exitFullscreen || document.webkitExitFullscreen; if (ex) { try { ex.call(document); } catch (e) {} } }
          }
        });
        document.addEventListener("fullscreenchange", function () {
          if (!(document.fullscreenElement || document.webkitFullscreenElement) && box.classList.contains("slides--fs")) {
            box.classList.remove("slides--fs"); fsBtn.setAttribute("aria-pressed", "false");
          }
        });
      }
      var dots = slides.map(function (_, n) {
        var d = document.createElement("button");
        d.className = "slides__dot"; d.type = "button"; d.setAttribute("aria-label", "Diapositive " + (n + 1));
        d.addEventListener("click", function () { go(n); });
        if (dotsWrap) dotsWrap.appendChild(d);
        return d;
      });
      function go(n) {
        i = Math.max(0, Math.min(slides.length - 1, n));
        track.style.transform = "translateX(" + (-i * 100) + "%)";
        dots.forEach(function (d, k) { d.setAttribute("aria-current", String(k === i)); });
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === slides.length - 1;
        if (counter) counter.textContent = (i + 1) + " / " + slides.length;
      }
      if (prev) prev.addEventListener("click", function () { go(i - 1); });
      if (next) next.addEventListener("click", function () { go(i + 1); });
      box.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
        else if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
        else if (e.key === "Escape" && (box.classList.contains("slides--wide") || box.classList.contains("slides--fs"))) {
          box.classList.remove("slides--wide"); box.classList.remove("slides--fs");
          var eb = box.querySelector("[data-slides-expand]"); if (eb) eb.setAttribute("aria-pressed", "false");
          var fb = box.querySelector("[data-slides-fs]"); if (fb) fb.setAttribute("aria-pressed", "false");
        }
      });
      go(0);
    });
  }

  /* ---- Icônes Lucide ----------------------------------------------------- */
  function renderIcons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  /* ---- INIT -------------------------------------------------------------- */
  apply(); // applique tôt (évite le flash)
  function init() {
    apply();
    wirePanel();
    wireTerminals();
    wireTermThemes();
    wireTermInput();
    wireTermDrag();
    wireTermResize();
    wireExercises();
    wireReadingProgress();
    wireDepth();
    wireWidthGrip();
    wireSwap();
    wireTocs();
    wireAnchors();
    wireResume();
    wireSearch();
    wireGloss();
    wireSlides();
    renderIcons();
    renderMath();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.SiteAstro = { open: openPanel, close: closePanel, setLang: setLang };
})();
