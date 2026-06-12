/* =============================================================================
   DOCK.JS — dock de l'en-tête : fenêtres flottantes (terminal, Pomodoro,
   passe-temps), grisage des passe-temps hors pause Pomodoro, modes du
   terminal (émulé / JSLinux / LinuxOnTab / local ttyd / distant).
   Registre des applis : src/data/dock.ts (champ `pastime`).
   Persistance : clés `site-astro-` → couvertes par l'export global.
   ============================================================================= */
import { mountSnake } from "./apps/snake.js";
import { mount2048 } from "./apps/g2048.js";
import { mountGol } from "./apps/gol.js";
import { mountLenia } from "./apps/lenia.js";

"use strict";

const lang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "fr");
const T = (fr, en) => (lang() === "en" ? en : fr);

/* ---- POMODORO — moteur : 25 min de lecture active → 5 min de passe-temps --- */
const POMO_KEY = "site-astro-pomodoro-v1";
const WORK_MS = 25 * 60 * 1000;
const BREAK_MS = 5 * 60 * 1000;
function pomoLoad() {
  try { return Object.assign({ workMs: 0, state: "work", breakEnd: 0 }, JSON.parse(localStorage.getItem(POMO_KEY) || "{}")); }
  catch (e) { return { workMs: 0, state: "work", breakEnd: 0 }; }
}
function pomoSave(p) { try { localStorage.setItem(POMO_KEY, JSON.stringify(p)); } catch (e) {} }
let pomo = pomoLoad();
let lastActivity = Date.now();
["scroll", "pointerdown", "keydown", "pointermove"].forEach((ev) =>
  window.addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true }));

const pomoListeners = [];
function onPomo(fn) { pomoListeners.push(fn); fn(pomo); }
function pomoEmit() { pomoListeners.forEach((fn) => fn(pomo)); }
function startBreak() { pomo.state = "break"; pomo.breakEnd = Date.now() + BREAK_MS; pomo.workMs = 0; pomoSave(pomo); pomoEmit(); }
function pomoTick() {
  if (pomo.state === "break") {
    if (Date.now() >= pomo.breakEnd) {
      pomo.state = "work"; pomo.breakEnd = 0; pomoSave(pomo);
      closePastimes();
    }
  } else if (document.visibilityState === "visible" && Date.now() - lastActivity < 60 * 1000) {
    pomo.workMs += 1000;
    if (pomo.workMs >= WORK_MS) { startBreak(); return; }
    if (pomo.workMs % 5000 === 0) pomoSave(pomo);
  }
  pomoEmit();
}
setInterval(pomoTick, 1000);

/* ---- FENÊTRES --------------------------------------------------------------- */
let topZ = 300;
const windows = new Map(); // id → { el, dispose }

/* Drag : écouteurs au niveau window (un iframe ne peut pas avaler le
   pointeur) + pointer-events coupés sur les iframes pendant le drag.
   La fenêtre reste manipulable : jamais sous l'en-tête, jamais hors écran. */
const HEADER_H = 64;
function clampWin(win, left, top) {
  win.style.left = Math.max(8, Math.min(window.innerWidth - 120, left)) + "px";
  win.style.top = Math.max(HEADER_H, Math.min(window.innerHeight - 56, top)) + "px";
  win.style.right = "auto"; win.style.bottom = "auto";
}
function makeDraggable(win) {
  const bar = win.querySelector("[data-dockwin-bar]");
  if (!bar) return;
  let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
  const move = (e) => {
    if (!dragging) return;
    clampWin(win, ox + e.clientX - sx, oy + e.clientY - sy);
    e.preventDefault();
  };
  const up = () => {
    dragging = false; win.removeAttribute("data-dragging");
    document.body.classList.remove("dockwin-dragging");
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  bar.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    dragging = true; sx = e.clientX; sy = e.clientY;
    const r = win.getBoundingClientRect(); ox = r.left; oy = r.top;
    win.setAttribute("data-dragging", "");
    document.body.classList.add("dockwin-dragging"); // iframes inertes
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    e.preventDefault();
  });
  win.addEventListener("pointerdown", () => { win.style.zIndex = String(++topZ); });
}

/* Placement en cascade depuis le bas-droit : chaque nouvelle fenêtre est
   décalée pour ne pas recouvrir les précédentes, autant que faire se peut. */
let cascade = 0;
function placeWindow(win) {
  const step = 36, n = cascade++ % 8;
  const w = Math.min(560, window.innerWidth - 32);
  const left = window.innerWidth - w - 24 - n * step;
  const top = Math.max(HEADER_H + 8, window.innerHeight - win.offsetHeight - 24 - n * step);
  clampWin(win, left, top);
}

function dockBtn(id) { return document.querySelector('[data-dock-app="' + id + '"]'); }
function setDockState(id, state) {
  const b = dockBtn(id); if (!b) return;
  if (state) b.setAttribute("data-state", state); else b.removeAttribute("data-state");
  b.setAttribute("aria-pressed", String(state === "open"));
}

function createWindow(id, title, iconSvg) {
  const win = document.createElement("div");
  win.className = "dockwin";
  win.setAttribute("data-dock-window", id);
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", title);
  win.innerHTML =
    '<div class="dockwin__bar" data-dockwin-bar>' +
    '<span class="dockwin__icon">' + (iconSvg || "") + "</span>" +
    '<span class="dockwin__title">' + title + "</span>" +
    '<button class="dockwin__tool" data-dockwin-grow type="button" aria-label="' + T("Agrandir", "Enlarge") + '">+</button>' +
    '<button class="dockwin__tool" data-dockwin-fs type="button" aria-pressed="false" aria-label="' + T("Plein écran", "Full screen") + '">⛶</button>' +
    '<button class="dockwin__tool" data-dockwin-min type="button" aria-label="' + T("Minimiser", "Minimise") + '">−</button>' +
    '<button class="dockwin__tool" data-dockwin-close type="button" aria-label="' + T("Fermer", "Close") + '">✕</button>' +
    "</div>" +
    '<div class="dockwin__body"></div>' +
    '<span class="dockwin__resize" data-dockwin-resize aria-hidden="true"></span>';
  document.body.appendChild(win);
  return win;
}

function wireWindowTools(id, win, onClose) {
  win.querySelector("[data-dockwin-min]").addEventListener("click", () => { win.hidden = true; setDockState(id, "min"); });
  win.querySelector("[data-dockwin-close]").addEventListener("click", () => onClose());
  const grow = win.querySelector("[data-dockwin-grow]");
  if (grow) grow.addEventListener("click", () => {
    const r = win.getBoundingClientRect();
    win.style.width = Math.min(window.innerWidth - 16, r.width * 1.2) + "px";
    win.style.height = Math.min(window.innerHeight - 16, (r.height || 400) * 1.2) + "px";
    clampWin(win, r.left, r.top);
  });
  const fs = win.querySelector("[data-dockwin-fs]");
  if (fs) fs.addEventListener("click", () => {
    const on = win.classList.toggle("dockwin--fs");
    fs.setAttribute("aria-pressed", String(on));
  });
  win.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && win.classList.contains("dockwin--fs")) {
      win.classList.remove("dockwin--fs");
      if (fs) fs.setAttribute("aria-pressed", "false");
    }
  });
  const rz = win.querySelector("[data-dockwin-resize]");
  if (rz) {
    let sx = 0, sy = 0, sw = 0, sh = 0, on = false;
    const move = (e) => {
      if (!on) return;
      win.style.width = Math.max(320, Math.min(window.innerWidth - 16, sw + e.clientX - sx)) + "px";
      win.style.height = Math.max(220, Math.min(window.innerHeight - 16, sh + e.clientY - sy)) + "px";
      e.preventDefault();
    };
    const up = () => {
      on = false;
      document.body.classList.remove("dockwin-dragging");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    rz.addEventListener("pointerdown", (e) => {
      on = true; sx = e.clientX; sy = e.clientY;
      const r = win.getBoundingClientRect(); sw = r.width; sh = r.height;
      document.body.classList.add("dockwin-dragging");
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      e.preventDefault();
    });
  }
  makeDraggable(win);
}

/* ---- APPLIS ------------------------------------------------------------------ */
const APPS = {
  snake: { title: () => "Snake", mount: mountSnake },
  g2048: { title: () => "2048", mount: mount2048 },
  gol: { title: () => T("Jeu de la vie", "Game of Life"), mount: mountGol },
  lenia: { title: () => "Lenia", mount: mountLenia },
  pomodoro: { title: () => "Pomodoro", mount: mountPomodoro },
};

function openApp(id) {
  const existing = windows.get(id);
  if (existing) { existing.el.hidden = false; existing.el.style.zIndex = String(++topZ); setDockState(id, "open"); return; }
  const app = APPS[id]; if (!app) return;
  const icon = dockBtn(id)?.querySelector(".dock__icon")?.innerHTML || "";
  const win = createWindow(id, app.title(), icon);
  const dispose = app.mount(win.querySelector(".dockwin__body"), T) || (() => {});
  windows.set(id, { el: win, dispose });
  wireWindowTools(id, win, () => closeApp(id));
  placeWindow(win);
  setDockState(id, "open");
}
function closeApp(id) {
  const w = windows.get(id); if (!w) return;
  w.dispose(); w.el.remove(); windows.delete(id); setDockState(id, "");
}
function toggleApp(id) {
  const w = windows.get(id);
  if (!w) openApp(id);
  else if (w.el.hidden) { w.el.hidden = false; w.el.style.zIndex = String(++topZ); setDockState(id, "open"); }
  else { w.el.hidden = true; setDockState(id, "min"); }
}
function closePastimes() {
  document.querySelectorAll('[data-dock-app][data-pastime="true"]').forEach((b) => {
    const id = b.getAttribute("data-dock-app");
    if (id === "terminal") return;
    closeApp(id);
  });
  refreshLocks();
}

/* ---- POMODORO — fenêtre -------------------------------------------------------- */
function mountPomodoro(body) {
  body.innerHTML = "";
  const el = document.createElement("div");
  el.className = "dockapp pomo";
  el.innerHTML =
    '<span class="pomo__phase" data-phase></span>' +
    '<span class="pomo__time" data-time>--:--</span>' +
    '<div class="pomo__track"><div class="pomo__fill" data-fill></div></div>' +
    '<p class="dockapp__hint">' +
    T("25 min de lecture active débloquent les passe-temps du dock pour 5 min.",
      "25 min of active reading unlock the dock pastimes for 5 min.") + "</p>" +
    '<div class="dockapp__bar">' +
    '<button class="dockapp__btn" data-force type="button">' + T("Déclencher la pause", "Start the break") + "</button>" +
    '<button class="dockapp__btn" data-reset type="button">' + T("Réinitialiser", "Reset") + "</button>" +
    "</div>";
  body.appendChild(el);
  const mmss = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    return String((s / 60) | 0).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  const update = (p) => {
    const brk = p.state === "break";
    el.classList.toggle("pomo--break", brk);
    el.querySelector("[data-phase]").textContent = brk
      ? T("Pause — passe-temps débloqués", "Break — pastimes unlocked")
      : T("Lecture", "Reading");
    el.querySelector("[data-time]").textContent = brk ? mmss(p.breakEnd - Date.now()) : mmss(WORK_MS - p.workMs);
    el.querySelector("[data-fill]").style.width = (brk ? ((p.breakEnd - Date.now()) / BREAK_MS) : (p.workMs / WORK_MS)) * 100 + "%";
  };
  el.querySelector("[data-force]").addEventListener("click", startBreak);
  el.querySelector("[data-reset]").addEventListener("click", () => {
    pomo = { workMs: 0, state: "work", breakEnd: 0 }; pomoSave(pomo); pomoEmit(); closePastimes();
  });
  pomoListeners.push(update); update(pomo);
  return () => { const i = pomoListeners.indexOf(update); if (i !== -1) pomoListeners.splice(i, 1); };
}

/* ---- GRISAGE des passe-temps -------------------------------------------------- */
function refreshLocks() {
  const unlocked = pomo.state === "break";
  document.querySelectorAll('[data-dock-app][data-pastime="true"]').forEach((b) => {
    b.setAttribute("data-locked", String(!unlocked));
    const label = b.querySelector(".util-btn__label");
    if (label && !unlocked) {
      const left = Math.ceil((WORK_MS - pomo.workMs) / 60000);
      label.setAttribute("data-left", String(left));
    }
  });
}

/* ---- TERMINAL — fenêtre pré-rendue + modes -------------------------------------- */
const TERM_MODE_KEY = "site-astro-dockterm-mode-v1";
const TERM_REMOTE_KEY = "site-astro-dockterm-remote-v1";
const TERM_MODES = {
  emulated: { fr: "Émulé (démo du site)", en: "Emulated (site demo)", src: null },
  jslinux: { fr: "JSLinux (bellard.org)", en: "JSLinux (bellard.org)", src: "https://bellard.org/jslinux/vm.html?url=alpine-x86.cfg&mem=192" },
  linuxontab: { fr: "LinuxOnTab", en: "LinuxOnTab", src: "https://linuxontab.com/shell/" },
  local: { fr: "Mon terminal local (ttyd)", en: "My local terminal (ttyd)", src: "http://localhost:7681" },
  remote: { fr: "Distant (URL ttyd/wetty)", en: "Remote (ttyd/wetty URL)", src: "" },
};
function termMode() { try { return localStorage.getItem(TERM_MODE_KEY) || "emulated"; } catch (e) { return "emulated"; } }
function termWin() { return document.querySelector('[data-dock-window="terminal"]'); }

function applyTermMode() {
  const win = termWin(); if (!win) return;
  const mode = termMode();
  const emu = win.querySelector('[data-term-pane="emulated"]');
  const frame = win.querySelector('[data-term-pane="frame"]');
  const iframe = win.querySelector("[data-term-frame]");
  const link = win.querySelector("[data-term-frame-link]");
  const help = win.querySelector("[data-term-help]");
  const label = win.querySelector("[data-term-mode-label]");
  if (label) label.textContent = lang() === "en" ? TERM_MODES[mode].en : TERM_MODES[mode].fr;
  if (mode === "emulated") { emu.hidden = false; frame.hidden = true; iframe.src = "about:blank"; return; }
  let src = TERM_MODES[mode].src;
  if (mode === "remote") { try { src = localStorage.getItem(TERM_REMOTE_KEY) || ""; } catch (e) { src = ""; } }
  emu.hidden = true; frame.hidden = false;
  help.hidden = mode !== "local";
  if (src && !win.hidden && iframe.src !== src) iframe.src = src;
  if (link) link.href = src || "#";
}
/* Quand un module embarque son terminal, sa colonne est l'emplacement par
   défaut : l'icône du dock affiche/masque CETTE colonne (pas un 2e terminal).
   L'option « détacher » déplace le même élément en fenêtre flottante (le
   contenu de la session est conservé) ; fermer la fenêtre le rattache. */
const DETACH_KEY = "site-astro-term-detached-v1";
function courseAside() { return document.querySelector(".course .course__aside"); }
function isDetached() { try { return localStorage.getItem(DETACH_KEY) === "on"; } catch (e) { return false; } }
function setDetached(v) { try { localStorage.setItem(DETACH_KEY, v ? "on" : "off"); } catch (e) {} }

function detachCourseTerminal() {
  const aside = courseAside(), win = termWin();
  if (!aside || !win) return;
  const term = aside.querySelector(".terminal");
  if (!term) return;
  const pane = win.querySelector('[data-term-pane="emulated"]');
  const dockTerm = pane.querySelector("#term-dock")?.closest(".terminal") || pane.querySelector(".terminal");
  if (dockTerm && dockTerm !== term) dockTerm.setAttribute("data-parked", "true"), (dockTerm.hidden = true);
  pane.appendChild(term);
  aside.closest(".course").setAttribute("data-term-off", "");
  setDetached(true);
  win.hidden = false; win.style.zIndex = String(++topZ);
  if (!win.style.left) placeWindow(win);
  setDockState("terminal", "open");
  applyTermMode();
  refreshDetachButtons();
}
function attachCourseTerminal() {
  const aside = courseAside(), win = termWin();
  if (!aside || !win) return;
  const pane = win.querySelector('[data-term-pane="emulated"]');
  const term = pane.querySelector(".terminal:not([data-parked])");
  if (term) aside.appendChild(term);
  const dockTerm = pane.querySelector('[data-parked="true"]');
  if (dockTerm) { dockTerm.hidden = false; dockTerm.removeAttribute("data-parked"); }
  aside.closest(".course").removeAttribute("data-term-off");
  try { localStorage.setItem("site-astro-term-visible-v1", "on"); } catch (e) {}
  setDetached(false);
  win.hidden = true;
  setDockState("terminal", "");
  refreshDetachButtons();
}
function refreshDetachButtons() {
  document.querySelectorAll("[data-term-detach]").forEach((b) => {
    const det = isDetached();
    b.setAttribute("aria-pressed", String(det));
    const tip = b.querySelector(".term-tip");
    if (tip) tip.textContent = det ? T("Rattacher à la colonne", "Re-attach to the column") : T("Détacher en fenêtre flottante", "Detach as a floating window");
  });
}

function openTerminalWindow() {
  const win = termWin(); if (!win) return;
  win.hidden = false;
  win.style.zIndex = String(++topZ);
  if (!win.style.left) placeWindow(win);
  setDockState("terminal", "open");
  applyTermMode();
}
function toggleTerminal() {
  const aside = courseAside();
  if (aside && !isDetached()) {
    // L'icône contrôle la colonne du cours.
    const course = aside.closest(".course");
    const off = course.toggleAttribute("data-term-off");
    try { localStorage.setItem("site-astro-term-visible-v1", off ? "off" : "on"); } catch (e) {}
    setDockState("terminal", off ? "min" : "open");
    if (!off) aside.scrollIntoView({ block: "nearest" });
    return;
  }
  const win = termWin(); if (!win) return;
  win.hidden = !win.hidden;
  setDockState("terminal", win.hidden ? "min" : "open");
  if (!win.hidden) {
    win.style.zIndex = String(++topZ);
    if (!win.style.left) placeWindow(win);
    applyTermMode();
  }
}
function closeTerminal() {
  if (courseAside() && isDetached()) { attachCourseTerminal(); return; }
  const win = termWin(); if (!win) return;
  win.hidden = true; setDockState("terminal", "");
  // « Éteindre » : on vide l'écran du terminal émulé et on coupe l'iframe.
  const screen = win.querySelector(".terminal__screen");
  if (screen) screen.innerHTML = "";
  const iframe = win.querySelector("[data-term-frame]");
  if (iframe) iframe.src = "about:blank";
}

/* Menu ⋮ : choix du mode (et bascule de l'atelier du cours si présent). */
function buildTermMenu(host) {
  const menu = document.createElement("div");
  menu.className = "dock__menu";
  menu.setAttribute("role", "menu");
  const aside = document.querySelector(".course__aside");
  let html = "";
  if (aside) {
    html += '<button type="button" data-act="aside" role="menuitem">' +
      T("Atelier du cours : afficher/masquer", "Course workshop: show/hide") + "</button>" +
      '<button type="button" data-act="detach" role="menuitem">' +
      T("Atelier du cours : détacher/rattacher", "Course workshop: detach/re-attach") + "</button>" +
      '<div class="dock__menu-label">' + T("Fenêtre terminal", "Terminal window") + "</div>";
  }
  for (const m of Object.keys(TERM_MODES)) {
    html += '<button type="button" role="menuitemradio" data-mode="' + m + '" aria-checked="' + String(termMode() === m) + '">' +
      (lang() === "en" ? TERM_MODES[m].en : TERM_MODES[m].fr) + "</button>";
  }
  html += '<input type="url" data-remote-url placeholder="https://mon-hote:7681" aria-label="URL du terminal distant" />';
  html += '<p class="dock__menu-note">' +
    T("JSLinux et LinuxOnTab sont téléchargés depuis leur site puis exécutés localement dans le navigateur.",
      "JSLinux and LinuxOnTab are downloaded from their site, then run locally in the browser.") + "</p>";
  menu.innerHTML = html;
  try { menu.querySelector("[data-remote-url]").value = localStorage.getItem(TERM_REMOTE_KEY) || ""; } catch (e) {}
  menu.querySelector("[data-remote-url]").addEventListener("change", (e) => {
    try { localStorage.setItem(TERM_REMOTE_KEY, e.target.value.trim()); } catch (err) {}
    if (termMode() === "remote") applyTermMode();
  });
  menu.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act && act.getAttribute("data-act") === "detach") {
      if (isDetached()) attachCourseTerminal(); else detachCourseTerminal();
      hide(); return;
    }
    if (act && act.getAttribute("data-act") === "aside") {
      const course = document.querySelector(".course");
      if (course) {
        const hidden = course.toggleAttribute("data-term-off");
        try { localStorage.setItem("site-astro-term-visible-v1", hidden ? "off" : "on"); } catch (err) {}
      }
      hide(); return;
    }
    const mb = e.target.closest("[data-mode]");
    if (mb) {
      try { localStorage.setItem(TERM_MODE_KEY, mb.getAttribute("data-mode")); } catch (err) {}
      menu.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-checked", String(b === mb)));
      openTerminalWindow();
      hide();
    }
  });
  function hide() { menu.hidden = true; host.setAttribute("aria-expanded", "false"); }
  document.addEventListener("pointerdown", (e) => { if (!menu.contains(e.target) && e.target !== host && !host.contains(e.target)) hide(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  return menu;
}

/* ---- INIT ---------------------------------------------------------------------- */
function init() {
  // Atelier du cours : états persistants (colonne masquée, détaché)
  const course = document.querySelector(".course");
  if (course) {
    try { if (localStorage.getItem("site-astro-term-visible-v1") === "off") course.setAttribute("data-term-off", ""); } catch (e) {}
    const actions = course.querySelector(".course__aside .terminal__actions");
    if (actions) {
      const det = document.createElement("button");
      det.type = "button"; det.className = "term-icon-btn"; det.setAttribute("data-term-detach", "");
      det.setAttribute("aria-pressed", "false");
      det.innerHTML = '⧉<span class="term-tip"></span>';
      det.addEventListener("click", () => { if (isDetached()) attachCourseTerminal(); else detachCourseTerminal(); });
      const min = document.createElement("button");
      min.type = "button"; min.className = "term-icon-btn";
      min.setAttribute("aria-label", T("Minimiser l'atelier", "Minimise the workshop"));
      min.innerHTML = '−<span class="term-tip">' + T("Minimiser (icône terminal du dock pour rouvrir)", "Minimise (dock terminal icon to reopen)") + "</span>";
      min.addEventListener("click", () => {
        course.setAttribute("data-term-off", "");
        try { localStorage.setItem("site-astro-term-visible-v1", "off"); } catch (e) {}
        setDockState("terminal", "min");
      });
      actions.prepend(min); actions.prepend(det);
      refreshDetachButtons();
    }
    if (isDetached()) detachCourseTerminal();
    else if (!course.hasAttribute("data-term-off")) setDockState("terminal", "open");
  }
  document.querySelectorAll("[data-dock-app]").forEach((btn) => {
    const id = btn.getAttribute("data-app") || btn.getAttribute("data-dock-app");
    btn.addEventListener("click", () => {
      if (btn.getAttribute("data-locked") === "true") { openApp("pomodoro"); return; }
      if (id === "terminal") toggleTerminal(); else toggleApp(id);
    });
  });
  const termWinEl = termWin();
  if (termWinEl) {
    wireWindowTools("terminal", termWinEl, closeTerminal);
    applyTermMode();
  }
  const opts = document.querySelector('[data-dock-opts="terminal"]');
  if (opts) {
    let menu = null;
    opts.addEventListener("click", () => {
      if (!menu) { menu = buildTermMenu(opts); opts.parentNode.appendChild(menu); menu.hidden = true; }
      menu.hidden = !menu.hidden;
      opts.setAttribute("aria-expanded", String(!menu.hidden));
    });
  }
  onPomo(refreshLocks);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
