/* =============================================================================
   DOCK.JS — dock de l'en-tête : fenêtres flottantes (terminal, Pomodoro),
   comptage de la lecture active et modes du terminal
   (simulé / Alpine WebAssembly / compagnon local ou SSH).
   Registre des applis : src/data/dock.ts.
   Persistance : clés `site-astro-` → couvertes par l'export global.
   ============================================================================= */
"use strict";

import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { TERMINAL_KEYS as TERM_KEYS } from "../data/terminal-keys.mjs";

const lang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "fr");
const T = (fr, en) => (lang() === "en" ? en : fr);

/* ---- POMODORO — 25 minutes de lecture réellement active ------------------- */
const POMO_KEY = "site-astro-pomodoro-v2";
const WORK_MS = 25 * 60 * 1000;
function pomoLoad() {
  try { return Object.assign({ workMs: 0, done: false }, JSON.parse(localStorage.getItem(POMO_KEY) || "{}")); }
  catch (e) { return { workMs: 0, done: false }; }
}
function pomoSave(p) { try { localStorage.setItem(POMO_KEY, JSON.stringify(p)); } catch (e) {} }
let pomo = pomoLoad();
let lastReadingActivity = 0;
const markReadingActivity = (event) => {
  const main = document.querySelector("main");
  if (!main) return;
  if (event.type === "scroll" || main.contains(event.target)) lastReadingActivity = Date.now();
};
["scroll", "pointerdown", "keydown", "touchstart"].forEach((ev) =>
  window.addEventListener(ev, markReadingActivity, { passive: true }));

const pomoListeners = [];
function onPomo(fn) { pomoListeners.push(fn); fn(pomo); }
function pomoEmit() { pomoListeners.forEach((fn) => fn(pomo)); }
function showBreakMessage() {
  window.alert(T(
    "Vous avez lu activement pendant 25 minutes. Il est temps de faire une pause.",
    "You have been actively reading for 25 minutes. It is time to take a break."
  ));
}
function pomoTick() {
  if (!pomo.done && document.visibilityState === "visible" && document.hasFocus() && Date.now() - lastReadingActivity < 60 * 1000) {
    pomo.workMs += 1000;
    if (pomo.workMs >= WORK_MS) {
      pomo.workMs = WORK_MS;
      pomo.done = true;
      pomoSave(pomo);
      pomoEmit();
      showBreakMessage();
      return;
    }
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
    T("Seule la lecture active de la page est comptabilisée. Après 25 minutes, un message vous invite à faire une pause.",
      "Only active reading on the page is counted. After 25 minutes, a message invites you to take a break.") + "</p>" +
    '<div class="dockapp__bar">' +
    '<button class="dockapp__btn" data-reset type="button">' + T("Nouvelle session", "New session") + "</button>" +
    "</div>";
  body.appendChild(el);
  const mmss = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    return String((s / 60) | 0).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  const update = (p) => {
    el.classList.toggle("pomo--done", p.done);
    el.querySelector("[data-phase]").textContent = p.done ? T("Pause recommandée", "Break recommended") : T("Lecture active", "Active reading");
    el.querySelector("[data-time]").textContent = mmss(WORK_MS - p.workMs);
    el.querySelector("[data-fill]").style.width = (p.workMs / WORK_MS) * 100 + "%";
  };
  el.querySelector("[data-reset]").addEventListener("click", () => {
    pomo = { workMs: 0, done: false }; pomoSave(pomo); pomoEmit();
  });
  pomoListeners.push(update); update(pomo);
  return () => { const i = pomoListeners.indexOf(update); if (i !== -1) pomoListeners.splice(i, 1); };
}

/* ---- TERMINAL — fenêtre pré-rendue + modes -------------------------------------- */
const TERM_MODE_KEY = "site-astro-dockterm-mode-v1";
const TERM_MODES = {
  emulated: { fr: "Émulé (démo du site)", en: "Emulated (site demo)", src: null },
  alpine: { fr: "Alpine local (WebAssembly)", en: "Local Alpine (WebAssembly)", src: null },
  companion: { fr: "Local ou SSH (compagnon)", en: "Local or SSH (companion)", src: null },
};
function termMode() {
  try {
    const mode = localStorage.getItem(TERM_MODE_KEY) || "emulated";
    return TERM_MODES[mode] ? mode : "emulated";
  } catch (e) { return "emulated"; }
}
function termWin() { return document.querySelector('[data-dock-window="terminal"]'); }
/* L'hôte de terminal : la « classe mère » de tous les modes. Une seule unité
   (pane émulé + pane iframe) qui vit soit dans la colonne du cours, soit dans
   la fenêtre flottante — détacher/rattacher déplace l'hôte entier, donc TOUS
   les modes se comportent de la même manière. */
function termHost() { return document.querySelector("[data-term-host]"); }
function hostInAside() { const h = termHost(); return !!(h && h.closest(".course__aside")); }

function applyTermMode() {
  const host = termHost(); if (!host) return;
  const mode = termMode();
  const emu = host.querySelector('[data-term-pane="emulated"]');
  const frame = host.querySelector('[data-term-pane="frame"]');
  const companion = host.querySelector('[data-term-pane="companion"]');
  const alpine = host.querySelector('[data-term-pane="alpine"]');
  const iframe = host.querySelector("[data-term-frame]");
  const link = host.querySelector("[data-term-frame-link]");
  const help = host.querySelector("[data-term-help]");
  document.querySelectorAll("[data-term-mode-label]").forEach((l) => {
    l.textContent = lang() === "en" ? TERM_MODES[mode].en : TERM_MODES[mode].fr;
  });
  document.querySelectorAll(".dock__menu [data-mode]").forEach((b) =>
    b.setAttribute("aria-checked", String(b.getAttribute("data-mode") === mode)));
  emu.hidden = mode !== "emulated";
  frame.hidden = true;
  companion.hidden = mode !== "companion";
  alpine.hidden = mode !== "alpine";
  iframe.src = "about:blank"; help.hidden = true; if (link) link.href = "#";
}
/* Quand un module embarque son terminal, sa colonne est l'emplacement par
   défaut : l'icône du dock affiche/masque CETTE colonne (pas un 2e terminal).
   L'option « détacher » déplace l'hôte entier en fenêtre flottante (session
   et mode conservés) ; fermer la fenêtre le rattache. */
const DETACH_KEY = "site-astro-term-detached-v1";
function courseAside() { return document.querySelector(".course .course__aside"); }
function isDetached() { try { return localStorage.getItem(DETACH_KEY) === "on"; } catch (e) { return false; } }
function setDetached(v) { try { localStorage.setItem(DETACH_KEY, v ? "on" : "off"); } catch (e) {} }

function detachCourseTerminal() {
  const aside = courseAside(), win = termWin(), host = termHost();
  if (!aside || !win || !host) return;
  win.querySelector(".dockwin__body").appendChild(host);
  aside.closest(".course").setAttribute("data-term-off", "");
  setDetached(true);
  win.hidden = false; win.style.zIndex = String(++topZ);
  if (!win.style.left) placeWindow(win);
  setDockState("terminal", "open");
  applyTermMode();
  refreshDetachButtons();
}
function attachCourseTerminal() {
  const aside = courseAside(), win = termWin(), host = termHost();
  if (!aside || !win || !host) return;
  aside.appendChild(host);
  aside.closest(".course").removeAttribute("data-term-off");
  try { localStorage.setItem("site-astro-term-visible-v1", "on"); } catch (e) {}
  setDetached(false);
  win.hidden = true;
  setDockState("terminal", "");
  applyTermMode();
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
    if (!off) { aside.scrollIntoView({ block: "nearest" }); applyTermMode(); }
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
  html += '<p class="dock__menu-note">' +
    T("Alpine et son moteur WebAssembly sont servis par ce site puis conservés dans le cache du navigateur.",
      "Alpine and its WebAssembly engine are served by this site, then retained in the browser cache.") + "</p>";
  menu.innerHTML = html;
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
      // Le mode s'applique là où vit l'hôte : colonne du cours si attaché,
      // fenêtre flottante sinon.
      if (hostInAside()) {
        const course = document.querySelector(".course");
        course.removeAttribute("data-term-off");
        try { localStorage.setItem("site-astro-term-visible-v1", "on"); } catch (err) {}
        setDockState("terminal", "open");
        applyTermMode();
      } else openTerminalWindow();
      hide();
    }
  });
  function hide() { menu.hidden = true; host.setAttribute("aria-expanded", "false"); }
  document.addEventListener("pointerdown", (e) => { if (!menu.contains(e.target) && e.target !== host && !host.contains(e.target)) hide(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  return menu;
}

/* ---- COMPAGNON LOCAL / SSH -------------------------------------------------- */
let companionSocket = null;
let companionTerminal = null;
let companionFit = null;
let alpineEmulator = null;
let alpineTerminal = null;
let alpineFit = null;
let alpineReady = false;
let alpineSerial = "";
const alpinePending = [];
function companionSend(message) {
  if (!companionSocket || companionSocket.readyState !== WebSocket.OPEN) return false;
  companionSocket.send(JSON.stringify(message));
  return true;
}

const VM_BASE = document.documentElement.getAttribute("data-base") || "/site";
let v86Loader = null;
function loadV86() {
  if (window.V86) return Promise.resolve(window.V86);
  if (v86Loader) return v86Loader;
  v86Loader = new Promise((resolve, reject) => {
    const script = document.createElement("script"); script.src = `${VM_BASE}/vm/libv86.js`;
    script.onload = () => resolve(window.V86); script.onerror = reject; document.head.appendChild(script);
  });
  return v86Loader;
}
async function cachedAsset(url, progress) {
  const cache = await caches.open("iadmin-vm-v1");
  const cached = await cache.match(url);
  if (cached) { progress(1, 1, true); return cached.arrayBuffer(); }
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader(); const chunks = []; let loaded = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); loaded += value.length; progress(loaded, total, false); }
  const blob = new Blob(chunks); await cache.put(url, new Response(blob, { headers: { "content-type": response.headers.get("content-type") || "application/octet-stream" } }));
  return blob.arrayBuffer();
}
function wireAlpine() {
  const pane = document.querySelector('[data-term-pane="alpine"]');
  const screen = document.querySelector("[data-alpine-screen]");
  const start = document.querySelector("[data-alpine-start]");
  const bar = document.querySelector("[data-alpine-progress]");
  const status = document.querySelector("[data-alpine-status]");
  if (!pane || !screen || !start || !bar || !status) return;
  alpineTerminal = new XTerm({ cursorBlink: true, fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, theme: { background: "#0d1720", foreground: "#e7edf2" } });
  alpineFit = new FitAddon(); alpineTerminal.loadAddon(alpineFit); alpineTerminal.open(screen);
  alpineTerminal.onData((data) => alpineEmulator?.serial0_send(data));
  new ResizeObserver(() => { if (!pane.hidden) alpineFit.fit(); }).observe(screen);
  start.addEventListener("click", async () => {
    if (alpineEmulator) { alpineTerminal.focus(); return; }
    start.disabled = true; status.textContent = T("Téléchargement de l’image Alpine…", "Downloading the Alpine image…");
    try {
      const isoUrl = `${VM_BASE}/vm/alpine/alpine-virt-3.21.3-x86.iso`;
      const [V86, iso] = await Promise.all([loadV86(), cachedAsset(isoUrl, (loaded, total, cached) => { bar.value = cached ? 100 : total ? Math.round(loaded * 100 / total) : 0; status.textContent = cached ? T("Image chargée depuis le cache.", "Image loaded from cache.") : `${bar.value}%`; })]);
      status.textContent = T("Démarrage de la VM…", "Starting the VM…");
      alpineEmulator = new V86({ wasm_path: `${VM_BASE}/vm/v86.wasm`, bios: { url: `${VM_BASE}/vm/seabios.bin` }, vga_bios: { url: `${VM_BASE}/vm/vgabios.bin` }, cdrom: { buffer: iso }, memory_size: 256 * 1024 * 1024, autostart: true });
      alpineEmulator.add_listener("serial0-output-byte", (byte) => {
        const char = String.fromCharCode(byte); alpineTerminal.write(char); alpineSerial = (alpineSerial + char).slice(-256);
        if (alpineSerial.endsWith("localhost login: ")) alpineEmulator.serial0_send("root\n");
        if (!alpineReady && /localhost:~# $/.test(alpineSerial)) {
          alpineReady = true; status.textContent = T("Alpine prête — session conservée lors des changements de mode.", "Alpine ready — session retained across mode changes.");
          while (alpinePending.length) alpineEmulator.serial0_send(alpinePending.shift());
        }
      });
      alpineEmulator.add_listener("emulator-started", () => { status.textContent = T("Alpine démarre — connexion root sans mot de passe.", "Alpine is starting — log in as root with no password."); setTimeout(() => alpineEmulator.serial0_send("\n"), 1200); alpineFit.fit(); alpineTerminal.focus(); });
    } catch (error) { start.disabled = false; status.textContent = T("Échec du chargement de la VM.", "Failed to load the VM."); }
  });
  document.addEventListener("terminal:command", (event) => { if (termMode() === "alpine") { event.preventDefault(); const data = event.detail.command + "\n"; if (alpineReady) alpineEmulator.serial0_send(data); else { alpinePending.push(data); start.click(); } } });
}
function companionStatus(fr, en) {
  const node = document.querySelector("[data-companion-status]");
  if (node) node.textContent = T(fr, en);
}
function wireCompanion() {
  const url = document.querySelector("[data-companion-url]");
  const connect = document.querySelector("[data-companion-connect]");
  const terminal = document.querySelector("[data-companion-terminal]");
  const screen = document.querySelector("[data-companion-screen]");
  if (!url || !connect || !terminal || !screen) return;
  companionTerminal = new XTerm({
    cursorBlink: true,
    convertEol: false,
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 13,
    theme: { background: "#0d1720", foreground: "#e7edf2", cursor: "#68d391" },
  });
  companionFit = new FitAddon();
  companionTerminal.loadAddon(companionFit);
  companionTerminal.open(screen);
  companionTerminal.onData((data) => companionSend({ type: "input", data }));
  const resize = () => {
    if (terminal.hidden) return;
    companionFit.fit();
    companionSend({ type: "resize", cols: companionTerminal.cols, rows: companionTerminal.rows });
  };
  new ResizeObserver(resize).observe(screen);
  connect.addEventListener("click", () => {
    const target = url.value.trim();
    if (!/^wss?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\//i.test(target)) {
      companionStatus("Adresse refusée : le compagnon doit écouter sur cette machine.", "Address rejected: the companion must listen on this machine.");
      return;
    }
    if (companionSocket) companionSocket.close();
    companionStatus("Connexion…", "Connecting…");
    companionSocket = new WebSocket(target);
    companionSocket.addEventListener("open", () => {
      terminal.hidden = false;
      url.value = "";
      companionStatus("Terminal connecté.", "Terminal connected.");
      requestAnimationFrame(() => { resize(); companionTerminal.focus(); });
    });
    companionSocket.addEventListener("message", (event) => {
      let msg; try { msg = JSON.parse(event.data); } catch (e) { return; }
      if (msg.type !== "output" || typeof msg.data !== "string") return;
      companionTerminal.write(msg.data);
    });
    companionSocket.addEventListener("close", () => companionStatus("Terminal déconnecté.", "Terminal disconnected."));
    companionSocket.addEventListener("error", () => companionStatus("Connexion impossible. Vérifiez l’adresse et le certificat local.", "Connection failed. Check the address and local certificate."));
  });
  document.addEventListener("terminal:command", (event) => {
    if (termMode() !== "companion") return;
    event.preventDefault();
    if (!companionSend({ type: "input", data: event.detail.command + "\n" })) {
      companionStatus("Connectez d’abord le compagnon.", "Connect the companion first.");
    }
  });
}

function wireTerminalKeys() {
  const echo = document.querySelector("[data-term-key-echo]");
  document.querySelectorAll("[data-term-key]").forEach((button) => button.addEventListener("click", () => {
    const key = TERM_KEYS[button.getAttribute("data-term-key")];
    if (!key) return;
    if (echo) { echo.textContent = key.label; echo.setAttribute("data-active", ""); setTimeout(() => echo.removeAttribute("data-active"), 450); }
    button.setAttribute("data-active", ""); setTimeout(() => button.removeAttribute("data-active"), 180);
    const mode = termMode();
    if (mode === "companion") companionSend({ type: "input", data: key.data });
    else if (mode === "alpine") { if (alpineReady) alpineEmulator.serial0_send(key.data); else { alpinePending.push(key.data); document.querySelector("[data-alpine-start]")?.click(); } }
    else if (mode === "emulated") document.dispatchEvent(new CustomEvent("terminal:simulated-key", { detail: { key: button.getAttribute("data-term-key"), data: key.data } }));
  }));
}

/* Contrôles communs à tous les modes (barre du terminal émulé ET barre du
   pane iframe) : détacher/rattacher (⧉) et minimiser (−). */
function makeDetachBtn() {
  const det = document.createElement("button");
  det.type = "button"; det.className = "term-icon-btn"; det.setAttribute("data-term-detach", "");
  det.setAttribute("aria-pressed", "false");
  det.innerHTML = '⧉<span class="term-tip"></span>';
  det.addEventListener("click", () => { if (isDetached()) attachCourseTerminal(); else detachCourseTerminal(); });
  return det;
}
function makeMinBtn(course) {
  const min = document.createElement("button");
  min.type = "button"; min.className = "term-icon-btn";
  min.setAttribute("aria-label", T("Minimiser l'atelier", "Minimise the workshop"));
  min.innerHTML = '−<span class="term-tip">' + T("Minimiser (icône terminal du dock pour rouvrir)", "Minimise (dock terminal icon to reopen)") + "</span>";
  min.addEventListener("click", () => {
    course.setAttribute("data-term-off", "");
    try { localStorage.setItem("site-astro-term-visible-v1", "off"); } catch (e) {}
    setDockState("terminal", "min");
  });
  return min;
}

/* ---- INIT ---------------------------------------------------------------------- */
function init() {
  wireCompanion();
  wireAlpine();
  wireTerminalKeys();
  // Atelier du cours : l'hôte de terminal adopte le terminal du module et
  // s'installe dans la colonne (emplacement par défaut). Le terminal
  // générique du dock est parqué : une seule session par page.
  const course = document.querySelector(".course");
  const aside = courseAside();
  const host = termHost();
  const dock = document.querySelector(".dock");
  if (course && aside && host) {
    const dockTerm = host.querySelector(".terminal");
    if (dockTerm) { dockTerm.setAttribute("data-parked", "true"); dockTerm.hidden = true; }
    const courseTerm = aside.querySelector(".terminal");
    if (courseTerm && dock) dock.setAttribute("data-dock-context", "terminal");
    if (courseTerm) host.querySelector('[data-term-pane="emulated"]').appendChild(courseTerm);
    aside.appendChild(host);
    // Barre du pane iframe (affichée en colonne seulement) : mêmes contrôles.
    const fbar = document.createElement("div");
    fbar.className = "terminal__bar term-host__framebar";
    fbar.innerHTML = '<span class="terminal__glyph" aria-hidden="true">❯_</span>' +
      '<span class="terminal__title" data-term-mode-label></span>' +
      '<span class="terminal__actions"></span>';
    host.querySelector('[data-term-pane="frame"]').prepend(fbar);
    try { if (localStorage.getItem("site-astro-term-visible-v1") === "off") course.setAttribute("data-term-off", ""); } catch (e) {}
    [courseTerm?.querySelector(".terminal__actions"), fbar.querySelector(".terminal__actions")].forEach((actions) => {
      if (!actions) return;
      actions.prepend(makeMinBtn(course));
      actions.prepend(makeDetachBtn());
    });
    refreshDetachButtons();
    if (isDetached()) detachCourseTerminal();
    else if (!course.hasAttribute("data-term-off")) setDockState("terminal", "open");
  }
  // site.js demande un retour au mode émulé (clic sur une commande du cours
  // alors qu'un mode iframe est affiché).
  document.addEventListener("term:mode", applyTermMode);
  document.querySelectorAll("[data-dock-app]").forEach((btn) => {
    const id = btn.getAttribute("data-app") || btn.getAttribute("data-dock-app");
    btn.addEventListener("click", () => {
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
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
