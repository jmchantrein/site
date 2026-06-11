/* =============================================================================
   SITE.JS — runtime partagé (chargé par Base.astro, bundlé par Astro)
   - Tiroirs Accessibilité + Paramètres (persistants via localStorage)
   - Langue par route (FR à la racine, EN sous /en/) — la bascule est un lien
   - Terminal « live » : commandes cliquables, saisie directe, thème local
   - Exercices : verrou de la solution tant que la réponse est vide
   - Sommaires (.toc) : double mobile généré + scrollspy
   - Ancres copiables, recherche Ctrl+K (index généré au build), diaporamas
   ============================================================================= */
"use strict";

const STORE = "site-astro-prefs-v1";
const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const root = document.documentElement;

const DEFAULTS = {
  scale: 1,        // 0.9 .. 1.6
  leading: 1.6,    // 1.4 .. 2.0  (≥1.5 supporté — WCAG 1.4.12)
  letter: 0,       // 0 .. 0.12 em
  word: 0,         // 0 .. 0.16 em
  contrast: false,
  motion: "auto",  // "auto" | "on" | "off"
  readfont: "default", // default | atkinson | dyslexic
  theme: "",       // "" = suivre la préférence système (marine/abysse)
  requireAnswer: true, // exiger une réponse avant d'afficher la solution
  width: 84,       // largeur globale du site en rem (60..160), bornée à 98vw
  measure: 66,     // largeur de la colonne de lecture en ch (56..96)
};

function load() {
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE) || "{}"));
  } catch (e) { return Object.assign({}, DEFAULTS); }
}
function save(p) { try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) {} }

let prefs = load();
const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* Thème par défaut : la préférence système (lisibilité d'abord — clair en
   polarité positive), Abysse seulement si le système est en sombre. */
const systemTheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "abysse" : "marine";

function apply() {
  root.style.fontSize = (prefs.scale * 100).toFixed(0) + "%";
  root.style.setProperty("--leading-body", String(prefs.leading));
  root.style.setProperty("--tracking", prefs.letter + "em");
  root.style.setProperty("--word-spacing", prefs.word + "em");
  if (prefs.contrast) root.setAttribute("data-contrast", "high"); else root.removeAttribute("data-contrast");

  const motionOff = prefs.motion === "off" || (prefs.motion === "auto" && prefersReduced);
  if (motionOff) root.setAttribute("data-motion", "off"); else root.removeAttribute("data-motion");

  if (prefs.readfont && prefs.readfont !== "default") root.setAttribute("data-readfont", prefs.readfont);
  else root.removeAttribute("data-readfont");

  root.setAttribute("data-theme", prefs.theme || systemTheme());

  const w = prefs.width || 84;
  root.style.setProperty("--page-max", "min(" + w + "rem, 98vw)");
  root.style.setProperty("--measure", (prefs.measure || 66) + "ch");

  root.setAttribute("data-require-answer", prefs.requireAnswer === false ? "off" : "on");
  document.dispatchEvent(new CustomEvent("sa:require-answer"));
}

/* La langue est portée par la ROUTE (une page = une langue, contenu EN sous
   /en/) : html[lang] est posé au build, la bascule d'en-tête est un lien. */
const curLang = () => (root.getAttribute("lang") === "en" ? "en" : "fr");

/* ---- Tiroirs Accessibilité + Paramètres ----------------------------------- */
let lastFocus = null, openName = null;
const qp = (s) => document.querySelector(s);
function setTriggers() {
  document.querySelectorAll("[data-a11y-trigger]").forEach((t) => t.setAttribute("aria-expanded", String(openName === "a11y")));
  document.querySelectorAll("[data-settings-trigger]").forEach((t) => t.setAttribute("aria-expanded", String(openName === "settings")));
}
function currentPanel() { return openName === "settings" ? qp("[data-settings-panel]") : qp("[data-a11y-panel]"); }
function openPanel(name) {
  name = name || "a11y";
  qp("[data-a11y-panel]").removeAttribute("data-open");
  qp("[data-settings-panel]").removeAttribute("data-open");
  const pn = name === "settings" ? qp("[data-settings-panel]") : qp("[data-a11y-panel]");
  lastFocus = document.activeElement; openName = name;
  qp("[data-a11y-overlay]").setAttribute("data-open", "true");
  pn.setAttribute("data-open", "true");
  setTriggers();
  pn.focus();
  document.addEventListener("keydown", onPanelKey);
}
function closePanel() {
  qp("[data-a11y-overlay]").removeAttribute("data-open");
  qp("[data-a11y-panel]").removeAttribute("data-open");
  qp("[data-settings-panel]").removeAttribute("data-open");
  openName = null; setTriggers();
  document.removeEventListener("keydown", onPanelKey);
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
function onPanelKey(e) {
  if (e.key === "Escape") closePanel();
  if (e.key === "Tab") {
    const pn = currentPanel(); if (!pn) return;
    const f = pn.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

function syncControls() {
  const q = (s) => document.querySelector(s);
  if (q("[data-a11y-scaleval]")) q("[data-a11y-scaleval]").textContent = Math.round(prefs.scale * 100) + "%";
  if (q("[data-a11y-scaleout]")) q("[data-a11y-scaleout]").textContent = Math.round(prefs.scale * 100) + "%";
  if (q("[data-a11y-lead]")) { q("[data-a11y-lead]").value = prefs.leading; q("[data-a11y-leadval]").textContent = Number(prefs.leading).toFixed(2).replace(/0$/, "").replace(/\.$/, ""); }
  if (q("[data-a11y-letter]")) { q("[data-a11y-letter]").value = prefs.letter; q("[data-a11y-letterval]").textContent = Number(prefs.letter).toFixed(2) + "em"; }
  if (q("[data-a11y-word]")) { q("[data-a11y-word]").value = prefs.word; q("[data-a11y-wordval]").textContent = Number(prefs.word).toFixed(2) + "em"; }
  if (q("[data-a11y-contrast]")) q("[data-a11y-contrast]").checked = !!prefs.contrast;
  const motionOff = prefs.motion === "off" || (prefs.motion === "auto" && prefersReduced);
  if (q("[data-a11y-motion]")) q("[data-a11y-motion]").checked = motionOff;
  if (q("[data-a11y-require]")) q("[data-a11y-require]").checked = prefs.requireAnswer !== false;
  if (q("[data-a11y-width]")) {
    q("[data-a11y-width]").value = prefs.width || 84;
    const wv = q("[data-a11y-widthval]");
    if (wv) wv.textContent = prefs.width >= 160 ? (curLang() === "en" ? "full" : "plein") : (prefs.width || 84) + " rem";
  }
  if (q("[data-a11y-measure]")) {
    q("[data-a11y-measure]").value = prefs.measure || 66;
    const mv = q("[data-a11y-measureval]");
    if (mv) mv.textContent = (prefs.measure || 66) + " ch";
  }
  document.querySelectorAll("[data-a11y-font] button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.getAttribute("data-set-font") === prefs.readfont));
  });
  document.querySelectorAll("[data-a11y-theme] button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.getAttribute("data-set-theme") === (prefs.theme || systemTheme())));
  });
  const sc = document.querySelector('[data-a11y-scale="-1"]'), si = document.querySelector('[data-a11y-scale="1"]');
  if (sc) sc.disabled = prefs.scale <= 0.9;
  if (si) si.disabled = prefs.scale >= 1.6;
}

function wirePanel() {
  document.querySelectorAll("[data-a11y-trigger]").forEach((t) => {
    t.addEventListener("click", () => { openName === "a11y" ? closePanel() : openPanel("a11y"); });
  });
  document.querySelectorAll("[data-settings-trigger]").forEach((t) => {
    t.addEventListener("click", () => { openName === "settings" ? closePanel() : openPanel("settings"); });
  });
  qp("[data-a11y-overlay]").addEventListener("click", closePanel);
  document.querySelectorAll("[data-a11y-close], [data-settings-close]").forEach((b) => b.addEventListener("click", closePanel));

  document.querySelectorAll("[data-a11y-scale]").forEach((b) => {
    b.addEventListener("click", () => {
      const d = parseInt(b.getAttribute("data-a11y-scale"), 10) * 0.1;
      prefs.scale = Math.min(1.6, Math.max(0.9, Math.round((prefs.scale + d) * 10) / 10));
      save(prefs); apply(); syncControls();
    });
  });
  const bind = (sel, key, parse) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener("input", () => { prefs[key] = parse(el.value); save(prefs); apply(); syncControls(); });
  };
  bind("[data-a11y-lead]", "leading", parseFloat);
  bind("[data-a11y-letter]", "letter", parseFloat);
  bind("[data-a11y-word]", "word", parseFloat);
  bind("[data-a11y-width]", "width", parseFloat);
  bind("[data-a11y-measure]", "measure", parseFloat);

  qp("[data-a11y-contrast]").addEventListener("change", (e) => { prefs.contrast = e.target.checked; save(prefs); apply(); syncControls(); });
  qp("[data-a11y-motion]").addEventListener("change", (e) => { prefs.motion = e.target.checked ? "off" : "on"; save(prefs); apply(); syncControls(); });
  qp("[data-a11y-require]").addEventListener("change", (e) => { prefs.requireAnswer = e.target.checked; save(prefs); apply(); syncControls(); });
  document.querySelectorAll("[data-a11y-font] button").forEach((b) => {
    b.addEventListener("click", () => { prefs.readfont = b.getAttribute("data-set-font"); save(prefs); apply(); syncControls(); });
  });
  document.querySelectorAll("[data-a11y-theme] button").forEach((b) => {
    b.addEventListener("click", () => { prefs.theme = b.getAttribute("data-set-theme"); save(prefs); apply(); syncControls(); });
  });
  document.querySelectorAll("[data-a11y-reset]").forEach((b) => {
    b.addEventListener("click", () => {
      prefs = Object.assign({}, DEFAULTS); save(prefs); apply(); syncControls();
    });
  });
  syncControls();
}

/* ---- TERMINAL « live » + commandes cliquables ------------------------------ */
function escapeHTML(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function getTerminal(cmd) {
  const sel = cmd.getAttribute("data-term");
  if (sel) { const t = document.querySelector(sel); if (t) return t; }
  return document.querySelector("[data-terminal]");
}

function typeInto(screen, text, done) {
  const motionOff = root.getAttribute("data-motion") === "off";
  const line = document.createElement("div");
  line.className = "term-line term-line--cmd";
  const prompt = '<span class="p">$</span> ';
  screen.appendChild(line);
  if (motionOff) {
    line.innerHTML = prompt + escapeHTML(text);
    screen.scrollTop = screen.scrollHeight; done();
    return;
  }
  let i = 0;
  const cur = '<span class="term-cursor"></span>';
  line.innerHTML = prompt + cur;
  const iv = setInterval(() => {
    i++;
    line.innerHTML = prompt + escapeHTML(text.slice(0, i)) + cur;
    screen.scrollTop = screen.scrollHeight;
    if (i >= text.length) { clearInterval(iv); line.innerHTML = prompt + escapeHTML(text); setTimeout(done, 160); }
  }, 22);
}

function revealOutput(screen, html, done) {
  const motionOff = root.getAttribute("data-motion") === "off";
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  const nodes = Array.prototype.slice.call(wrap.children);
  if (!nodes.length) { done && done(); return; }
  let idx = 0;
  (function step() {
    if (idx >= nodes.length) { done && done(); return; }
    screen.appendChild(nodes[idx]);
    screen.scrollTop = screen.scrollHeight;
    idx++;
    if (motionOff) step(); else setTimeout(step, 90);
  })();
}

function runCommand(cmd) {
  const term = getTerminal(cmd); if (!term) return;
  // Terminal hors écran (mobile : l'atelier est sous l'article) → l'amener en vue.
  const r = term.getBoundingClientRect();
  if (r.top > window.innerHeight || r.bottom < 0) term.scrollIntoView({ block: "nearest" });
  const screen = term.querySelector(".terminal__screen");
  const text = cmd.getAttribute("data-cmd") || (cmd.querySelector("code") ? cmd.querySelector("code").textContent : "");
  const tpl = cmd.parentNode.querySelector(".cmd-out") ||
    (cmd.nextElementSibling && cmd.nextElementSibling.matches(".cmd-out") ? cmd.nextElementSibling : null);
  const out = tpl ? tpl.innerHTML : "";
  if (cmd.getAttribute("data-running") === "true") return;
  cmd.setAttribute("data-running", "true");
  typeInto(screen, text, () => {
    revealOutput(screen, out, () => {
      cmd.setAttribute("data-done", "true");
      cmd.removeAttribute("data-running");
    });
  });
}

function wireTerminals() {
  document.querySelectorAll(".cmd").forEach((cmd) => {
    cmd.addEventListener("click", () => runCommand(cmd));
    cmd.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); runCommand(cmd); } });
  });
  document.querySelectorAll("[data-term-replay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const term = btn.closest(".terminal");
      const screen = term.querySelector(".terminal__screen");
      const initial = term.querySelector("template.term-initial");
      screen.innerHTML = initial ? initial.innerHTML : "";
      screen.scrollTop = 0;
      document.querySelectorAll(".cmd").forEach((c) => {
        if (!c.getAttribute("data-term") || c.getAttribute("data-term") === "#" + term.id) c.removeAttribute("data-done");
      });
    });
  });
  // initialise chaque écran avec son contenu initial
  document.querySelectorAll(".terminal").forEach((term) => {
    const screen = term.querySelector(".terminal__screen");
    const initial = term.querySelector("template.term-initial");
    if (initial && screen && !screen.children.length) screen.innerHTML = initial.innerHTML;
  });
}

/* ---- THÈME du terminal (clair/sombre) — local au terminal, persistant ------ */
const TERM_THEME_KEY = "site-astro-term-theme-v1";
function readTermTheme() { try { return localStorage.getItem(TERM_THEME_KEY) || "dark"; } catch (e) { return "dark"; } }
function applyTermTheme(theme) {
  document.querySelectorAll(".terminal").forEach((t) => {
    if (theme === "light") t.setAttribute("data-term-theme", "light");
    else t.removeAttribute("data-term-theme");
  });
  document.querySelectorAll("[data-term-theme-btn]").forEach((b) => {
    b.setAttribute("aria-pressed", String(theme === "light"));
    b.setAttribute("aria-label", theme === "light"
      ? "Thème du terminal : clair — basculer en sombre"
      : "Thème du terminal : sombre — basculer en clair");
  });
}
function wireTermThemes() {
  applyTermTheme(readTermTheme());
  document.querySelectorAll("[data-term-theme-btn]").forEach((b) => {
    b.addEventListener("click", () => {
      const next = readTermTheme() === "light" ? "dark" : "light";
      try { localStorage.setItem(TERM_THEME_KEY, next); } catch (e) {}
      applyTermTheme(next);
    });
  });
}

/* ---- SAISIE DIRECTE de commandes (interpréteur simulé) --------------------- */
function outLine(cls, fr, en) {
  return '<div class="term-line ' + cls + '">' +
    (fr != null ? '<span data-lang="fr">' + fr + "</span>" : "") +
    (en != null ? '<span data-lang="en">' + en + "</span>" : "") + "</div>";
}

function termInterpret(raw) {
  const cmd = raw.trim().replace(/\s+/g, " ");
  if (cmd === "") return { ignore: true };
  if (cmd === "clear" || cmd === "cls") return { clear: true };
  const M = {
    help:
      outLine("term-line--out", "commandes disponibles :", "available commands:") +
      '<div class="term-line term-line--out">help · clear · ls · pwd · whoami · uname -r</div>' +
      '<div class="term-line term-line--out">podman ps · podman images · cat /etc/os-release</div>' +
      '<div class="term-line term-line--out">podman run --rm alpine ps -ef</div>' +
      '<div class="term-line term-line--out">podman run --rm -m 64m alpine free -m</div>',
    ls: '<div class="term-line term-line--out">Containerfile  app/  README.md</div>',
    "ls -l":
      '<div class="term-line term-line--out">-rw-r--r-- 1 dev dev  214 Containerfile</div>' +
      '<div class="term-line term-line--out">drwxr-xr-x 2 dev dev 4096 app</div>' +
      '<div class="term-line term-line--out">-rw-r--r-- 1 dev dev  118 README.md</div>',
    pwd: '<div class="term-line term-line--out">/home/dev/atelier</div>',
    whoami: '<div class="term-line term-line--out">dev</div>',
    id: '<div class="term-line term-line--out">uid=1000(dev) gid=1000(dev) groups=1000(dev)</div>',
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
    "podman run --rm alpine ps -ef":
      '<div class="term-line term-line--out">PID   USER     TIME  COMMAND</div>' +
      '<div class="term-line term-line--out">    1 root      0:00 ps -ef</div>' +
      outLine("term-line--ok", '<span class="tag">note</span>un seul processus, PID 1 — l\'hôte est invisible.', '<span class="tag">note</span>a single process, PID 1 — the host is invisible.'),
    "podman run --rm -m 64m alpine free -m":
      '<div class="term-line term-line--out">              total    used    free</div>' +
      '<div class="term-line term-line--out">Mem:             64       3      61</div>' +
      outLine("term-line--warn", '<span class="tag">limite</span>mémoire plafonnée à 64 Mo par le cgroup.', '<span class="tag">limit</span>memory capped at 64 MB by the cgroup.'),
    "cat /etc/os-release":
      '<div class="term-line term-line--out">NAME="Alpine Linux"</div>' +
      '<div class="term-line term-line--out">VERSION_ID=3.20.0</div>',
  };
  if (M[cmd]) return { html: M[cmd] };
  return {
    html:
      outLine("term-line--warn",
        '<span class="tag">erreur</span>bash : ' + escapeHTML(cmd.split(" ")[0]) + " : commande introuvable",
        '<span class="tag">error</span>bash: ' + escapeHTML(cmd.split(" ")[0]) + ": command not found") +
      outLine("term-line--out", "tapez <strong>help</strong> pour la liste.", "type <strong>help</strong> for the list."),
  };
}

function wireTermInput() {
  document.querySelectorAll(".terminal").forEach((term) => {
    const form = term.querySelector("[data-term-input]");
    if (!form) return;
    const input = form.querySelector("input");
    const screen = term.querySelector(".terminal__screen");
    const hist = []; let hi = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value;
      const res = termInterpret(v);
      if (res.ignore) { input.value = ""; return; }
      const line = document.createElement("div");
      line.className = "term-line term-line--cmd";
      line.innerHTML = '<span class="p">$</span> ' + escapeHTML(v.trim());
      screen.appendChild(line);
      hist.push(v.trim()); hi = hist.length;
      input.value = "";
      if (res.clear) { screen.innerHTML = ""; screen.scrollTop = 0; return; }
      revealOutput(screen, res.html, () => { screen.scrollTop = screen.scrollHeight; });
      screen.scrollTop = screen.scrollHeight;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        if (hi > 0) { hi--; input.value = hist[hi]; e.preventDefault(); moveCaretEnd(input); }
      } else if (e.key === "ArrowDown") {
        if (hi < hist.length - 1) { hi++; input.value = hist[hi]; }
        else { hi = hist.length; input.value = ""; }
        e.preventDefault();
      }
    });
    screen.addEventListener("click", (e) => {
      if (window.getSelection && String(window.getSelection()).length) return;
      if (e.target.closest("a, button, .cmd")) return;
      input.focus();
    });
  });
}
function moveCaretEnd(el) { const v = el.value; el.value = ""; el.value = v; }

/* ---- EXERCICE : verrou de la solution tant que la réponse est vide --------- */
function answerGateOn() { return root.getAttribute("data-require-answer") !== "off"; }
function refreshExercise(ex) {
  const mode = ex.getAttribute("data-gate-mode"); // "on" | "off" | null → suit le réglage global
  const gate = mode === "on" ? true : mode === "off" ? false : answerGateOn();
  const field = ex.querySelector("[data-exercise-answer] textarea, [data-exercise-answer] input");
  const details = ex.querySelector(".exercise__solution");
  if (!details) return;
  const summary = details.querySelector("summary");
  const answered = field ? field.value.trim().length >= 1 : true;
  const locked = gate && !answered;
  ex.setAttribute("data-gate", gate ? "on" : "off");
  ex.setAttribute("data-answered", String(answered));
  ex.setAttribute("data-locked", String(locked));
  if (summary) summary.setAttribute("aria-disabled", String(locked));
  if (locked && details.open) details.open = false;
}
/* Réponses persistées par page (l'élève retrouve son brouillon au rechargement). */
const ANSWERS_KEY = "site-astro-answers:" + location.pathname;
function loadAnswers() { try { return JSON.parse(localStorage.getItem(ANSWERS_KEY) || "{}"); } catch (e) { return {}; } }
function saveAnswer(id, text) {
  try {
    const all = loadAnswers();
    if (text.trim()) all[id] = text; else delete all[id];
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(all));
  } catch (e) {}
}
function wireExercises() {
  const list = document.querySelectorAll(".exercise");
  const answers = loadAnswers();
  list.forEach((ex) => {
    const field = ex.querySelector("[data-exercise-answer] textarea, [data-exercise-answer] input");
    const details = ex.querySelector(".exercise__solution");
    if (!details) return;
    const summary = details.querySelector("summary");
    if (field && field.id && answers[field.id] && !field.value) field.value = answers[field.id];
    refreshExercise(ex);
    if (field) field.addEventListener("input", () => { refreshExercise(ex); if (field.id) saveAnswer(field.id, field.value); });
    if (summary) {
      summary.addEventListener("click", (e) => {
        if (ex.getAttribute("data-locked") === "true") { e.preventDefault(); if (field) field.focus(); }
      });
      summary.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && ex.getAttribute("data-locked") === "true") { e.preventDefault(); if (field) field.focus(); }
      });
    }
  });
  document.addEventListener("sa:require-answer", () => list.forEach(refreshExercise));
}

/* ---- BARRE DE PROGRESSION de lecture --------------------------------------- */
function wireReadingProgress() {
  const bar = document.querySelector("[data-read-progress]");
  if (!bar) return;
  const article = document.querySelector(".course__reading") || document.querySelector("main");
  function update() {
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = -rect.top;
    const p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : rect.top <= 0 ? 1 : 0;
    bar.style.width = (p * 100).toFixed(1) + "%";
    bar.parentNode.setAttribute("aria-valuenow", Math.round(p * 100));
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* ---- SOMMAIRE LATÉRAL (.toc) — double mobile généré + scrollspy ------------ */
function wireTocs() {
  document.querySelectorAll(".toc").forEach((toc) => {
    if (toc.hasAttribute("data-toc-no-mobile")) return;
    const layout = toc.closest(".toc-layout");
    const list = toc.querySelector("ol, ul");
    if (!layout || !list) return;
    const prev = layout.previousElementSibling;
    if (prev && prev.classList && prev.classList.contains("toc-m")) return;
    const det = document.createElement("details");
    det.className = "toc-m";
    const sum = document.createElement("summary");
    sum.innerHTML = '<span data-lang="fr">Sommaire</span><span data-lang="en">Contents</span>';
    det.appendChild(sum);
    det.appendChild(list.cloneNode(true));
    det.addEventListener("click", (e) => { if (e.target.closest("a")) det.open = false; });
    layout.parentNode.insertBefore(det, layout);
  });
  // Scrollspy : signale la section en cours de lecture (aria-current)
  document.querySelectorAll(".toc").forEach((toc) => {
    const links = [].filter.call(toc.querySelectorAll("a"), (a) => {
      const h = a.getAttribute("href"); return h && h.charAt(0) === "#";
    });
    const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
    if (!links.length || targets.some((t) => !t)) return;
    let ticking = false;
    function spy() {
      ticking = false;
      let cur = -1;
      for (let i = 0; i < targets.length; i++) { if (targets[i].getBoundingClientRect().top <= 120) cur = i; }
      links.forEach((a, k) => { if (k === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    }
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  });
}

/* ---- ANCRES COPIABLES — « # » au survol des titres -------------------------- */
function wireAnchors() {
  document.querySelectorAll("main h2[id], main h3[id]").forEach((h) => {
    if (h.closest(".slides, .exercise, .escape, .terminal, .a11y-panel, .cmdk")) return;
    if (h.querySelector(".h-anchor")) return;
    const id = h.id;
    const b = document.createElement("button");
    b.type = "button"; b.className = "h-anchor"; b.textContent = "#";
    b.setAttribute("aria-label", "Copier le lien vers cette section");
    b.addEventListener("click", () => {
      const url = location.origin + location.pathname + "#" + id;
      const fb = () => {
        b.textContent = "✓"; b.setAttribute("data-copied", "true");
        setTimeout(() => { b.textContent = "#"; b.removeAttribute("data-copied"); }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(fb, fb); else fb();
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    });
    h.appendChild(b);
  });
}

/* ---- RECHERCHE LOCALE — palette Ctrl/Cmd+K ---------------------------------
   Index généré au build (src/pages/search-index.json.ts), chargé à la première
   ouverture — aucun serveur. */
function wireSearch() {
  let INDEX = null;
  let ui = null, input, list, items = [], sel = 0, prevFocus = null;
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function build() {
    ui = document.createElement("div");
    ui.className = "cmdk";
    ui.innerHTML = '<div class="cmdk__backdrop"></div>' +
      '<div class="cmdk__panel" role="dialog" aria-modal="true" aria-label="Recherche sur le site">' +
      '<div class="cmdk__input"><span class="p" aria-hidden="true">❯</span>' +
      '<input type="text" autocomplete="off" spellcheck="false" aria-label="Rechercher une section">' +
      '<kbd>Esc</kbd></div><ul class="cmdk__list" role="listbox"></ul></div>';
    document.body.appendChild(ui);
    input = ui.querySelector("input"); list = ui.querySelector(".cmdk__list");
    ui.querySelector(".cmdk__backdrop").addEventListener("click", close);
    // Piège à focus : le dialogue est modal, Tab reste sur le champ de saisie
    // (les résultats se parcourent aux flèches, comme dans toute palette).
    ui.addEventListener("keydown", (e) => { if (e.key === "Tab") { e.preventDefault(); input.focus(); } });
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { move(1); e.preventDefault(); }
      else if (e.key === "ArrowUp") { move(-1); e.preventDefault(); }
      else if (e.key === "Enter") { const a = items[sel]; if (a) a.click(); }
    });
  }
  function render(q) {
    const nq = norm(q || "");
    const res = (INDEX || []).filter((en) => !nq || norm(en.t + " " + en.p + " " + (en.b || "")).indexOf(nq) !== -1).slice(0, 14);
    list.innerHTML = ""; items = []; sel = 0;
    let lastPage = null;
    res.forEach((en) => {
      if (en.p !== lastPage) {
        const g = document.createElement("li"); g.className = "cmdk__group"; g.textContent = en.p;
        list.appendChild(g); lastPage = en.p;
      }
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "cmdk__item"; a.setAttribute("role", "option");
      a.href = en.page + (en.hash ? "#" + en.hash : "");
      a.textContent = en.t;
      a.addEventListener("click", close);
      li.appendChild(a); list.appendChild(li); items.push(a);
    });
    if (!res.length) {
      const em = document.createElement("li"); em.className = "cmdk__empty";
      em.textContent = INDEX ? (curLang() === "en" ? "No results" : "Aucun résultat") : "…";
      list.appendChild(em);
    }
    mark();
  }
  function mark() {
    items.forEach((a, k) => a.setAttribute("aria-selected", String(k === sel)));
    const c = items[sel];
    if (c) {
      const r = c.getBoundingClientRect(), lr = list.getBoundingClientRect();
      if (r.bottom > lr.bottom) list.scrollTop += r.bottom - lr.bottom;
      if (r.top < lr.top) list.scrollTop -= lr.top - r.top;
    }
  }
  function move(d) { if (!items.length) return; sel = (sel + d + items.length) % items.length; mark(); }
  function open() {
    if (!ui) build();
    prevFocus = document.activeElement;
    input.setAttribute("placeholder", curLang() === "en" ? "Search a section…" : "Rechercher une section…");
    ui.setAttribute("data-open", "true");
    input.value = ""; render(""); input.focus();
    if (!INDEX) {
      fetch(BASE + "/search-index.json")
        .then((r) => r.json())
        .then((data) => { INDEX = data; if (ui.getAttribute("data-open") === "true") render(input.value); })
        .catch(() => { INDEX = []; });
    }
  }
  function close() {
    if (ui) ui.removeAttribute("data-open");
    if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
  }
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (ui && ui.getAttribute("data-open") === "true") close(); else open();
    } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // « / » : convention répandue (Wikipédia, GitHub) — jamais quand on tape du texte.
      const t = e.target;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (!typing && !(ui && ui.getAttribute("data-open") === "true")) { e.preventDefault(); open(); }
    } else if (e.key === "Escape" && ui && ui.getAttribute("data-open") === "true") { close(); e.preventDefault(); }
  });
  document.querySelectorAll("[data-search-trigger]").forEach((b) => b.addEventListener("click", open));
}

/* ---- DIAPORAMA (slides) ----------------------------------------------------- */
function wireSlides() {
  document.querySelectorAll("[data-slides]").forEach((box) => {
    const track = box.querySelector("[data-slides-track]");
    if (!track) return;
    const slides = [].slice.call(track.children);
    const prev = box.querySelector("[data-slides-prev]");
    const next = box.querySelector("[data-slides-next]");
    const dotsWrap = box.querySelector("[data-slides-dots]");
    const counter = box.querySelector("[data-slides-counter]");
    let i = 0;
    const expandBtn = box.querySelector("[data-slides-expand]");
    const fsBtn = box.querySelector("[data-slides-fs]");
    if (expandBtn) {
      expandBtn.addEventListener("click", function () {
        const on = box.classList.toggle("slides--wide");
        this.setAttribute("aria-pressed", String(on));
        if (on) box.focus();
      });
    }
    if (fsBtn) {
      fsBtn.addEventListener("click", () => {
        const on = box.classList.toggle("slides--fs");
        fsBtn.setAttribute("aria-pressed", String(on));
        if (on) {
          box.focus();
          const req = box.requestFullscreen || box.webkitRequestFullscreen;
          if (req) { try { const r = req.call(box); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
        } else {
          const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
          if (fsEl === box) { const ex = document.exitFullscreen || document.webkitExitFullscreen; if (ex) { try { ex.call(document); } catch (e) {} } }
        }
      });
      document.addEventListener("fullscreenchange", () => {
        if (!(document.fullscreenElement || document.webkitFullscreenElement) && box.classList.contains("slides--fs")) {
          box.classList.remove("slides--fs"); fsBtn.setAttribute("aria-pressed", "false");
        }
      });
    }
    const dots = slides.map((_, n) => {
      const d = document.createElement("button");
      d.className = "slides__dot"; d.type = "button"; d.setAttribute("aria-label", "Diapositive " + (n + 1));
      d.addEventListener("click", () => go(n));
      if (dotsWrap) dotsWrap.appendChild(d);
      return d;
    });
    function go(n) {
      i = Math.max(0, Math.min(slides.length - 1, n));
      track.style.transform = "translateX(" + -i * 100 + "%)";
      // Les diapos hors écran sont retirées de l'arbre d'accessibilité et du
      // parcours clavier (inert) — seul le contenu visible est atteignable.
      slides.forEach((s, k) => {
        if (k === i) { s.removeAttribute("aria-hidden"); s.removeAttribute("inert"); }
        else { s.setAttribute("aria-hidden", "true"); s.setAttribute("inert", ""); }
      });
      dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
      if (counter) counter.textContent = i + 1 + " / " + slides.length;
    }
    if (prev) prev.addEventListener("click", () => go(i - 1));
    if (next) next.addEventListener("click", () => go(i + 1));
    box.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
      else if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
      else if (e.key === "Escape" && (box.classList.contains("slides--wide") || box.classList.contains("slides--fs"))) {
        box.classList.remove("slides--wide"); box.classList.remove("slides--fs");
        if (expandBtn) expandBtn.setAttribute("aria-pressed", "false");
        if (fsBtn) fsBtn.setAttribute("aria-pressed", "false");
      }
    });
    go(0);
  });
}

/* ---- IMPRESSION : déplier solutions et diapos masquées pour le papier ------- */
function wirePrint() {
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll(".exercise__solution, .toc-m").forEach((d) => {
      d.setAttribute("data-was-open", d.open ? "1" : "");
      d.open = true;
    });
    document.querySelectorAll(".slide").forEach((s) => { s.removeAttribute("aria-hidden"); s.removeAttribute("inert"); });
  });
  window.addEventListener("afterprint", () => {
    document.querySelectorAll("[data-was-open]").forEach((d) => {
      d.open = d.getAttribute("data-was-open") === "1";
      d.removeAttribute("data-was-open");
    });
  });
}

/* ---- INIT -------------------------------------------------------------------- */
apply(); // applique tôt (évite le flash entre l'anti-FOUC inline et le bundle)
function init() {
  apply();
  wirePanel();
  wireTerminals();
  wireTermThemes();
  wireTermInput();
  wireExercises();
  wireReadingProgress();
  wireTocs();
  wireAnchors();
  wireSearch();
  wireSlides();
  wirePrint();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

window.SiteAstro = { open: openPanel, close: closePanel };
