/* GLOSSAIRE — popup de survol des termes auto-liés (a.gloss) et rail
   latéral de consultation.
   - Survol OU focus clavier → définition brève (+ portrait Commons pour
     les personnages, + lien Wikipédia). Conforme WCAG 1.4.13 : révocable
     (Échap), survolable, persistante. Tactile : 1er appui = popup,
     2e = fiche.
   - Clic → selon la préférence lecteur (panneau Paramètres, clé
     site-astro-gloss-open-v1, couverte par l'export global) : fiche dans
     le RAIL latéral droit quand la place le permet (défaut), sinon
     navigation vers la page.
   Données : /glossaire.json (build) ; le rail charge la page statique de
   la fiche et en extrait l'article (même origine, aucune duplication). */

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const EN = document.documentElement.lang === "en";
const PREF_KEY = "site-astro-gloss-open-v1"; // "rail" | "page"
const WIDE = "(min-width: 75rem)";

let data = null;
let loading = null;
let pop = null;
let anchor = null;
let hideTimer = 0;
let rail = null;
let railReturnFocus = null;

/* ——— préférence lecteur ——— */
function getPref() {
  try { return localStorage.getItem(PREF_KEY) === "page" ? "page" : "rail"; } catch { return "rail"; }
}
function setPref(v) {
  try { localStorage.setItem(PREF_KEY, v); } catch { /* stockage plein : site.js alerte déjà */ }
}

function load() {
  if (data) return Promise.resolve(data);
  loading ??= fetch(`${BASE}/glossaire.json`)
    .then((r) => r.json())
    .then((all) => (data = EN ? all.en : all.fr))
    .catch(() => (data = {}));
  return loading;
}

/* ——— popup ——— */
function ensurePop() {
  if (pop) return pop;
  pop = document.createElement("div");
  pop.className = "gloss-pop";
  pop.id = "gloss-pop";
  pop.setAttribute("role", "tooltip");
  pop.hidden = true;
  pop.addEventListener("mouseenter", () => clearTimeout(hideTimer));
  pop.addEventListener("mouseleave", scheduleHide);
  document.body.appendChild(pop);
  return pop;
}

function labelType(e) {
  if (e.type === "personnage") return EN ? "figure" : "personnage";
  if (e.angl) return EN ? "borrowed term" : "anglicisme";
  return null;
}

function render(e) {
  const p = ensurePop();
  p.replaceChildren();
  if (e.img) {
    // Portrait affiché depuis Wikimedia Commons (exception externe assumée).
    const im = document.createElement("img");
    im.src = e.img;
    im.alt = "";
    im.className = "gloss-pop__img";
    im.loading = "lazy";
    im.referrerPolicy = "no-referrer";
    im.addEventListener("error", () => im.remove());
    p.appendChild(im);
  }
  const head = document.createElement("p");
  head.className = "gloss-pop__head";
  const term = document.createElement("strong");
  term.textContent = e.t;
  head.appendChild(term);
  if (e.x && e.x.toLowerCase() !== e.t.toLowerCase()) {
    const x = document.createElement("span");
    x.className = "gloss-pop__x";
    x.textContent = EN ? ` · fr : ${e.x}` : ` · en : ${e.x}`;
    head.appendChild(x);
  }
  const tag = labelType(e);
  if (tag) {
    const b = document.createElement("span");
    b.className = "gloss-pop__tag";
    b.textContent = tag;
    head.appendChild(b);
  }
  p.appendChild(head);
  const bref = document.createElement("p");
  bref.className = "gloss-pop__bref";
  bref.textContent = e.bref;
  p.appendChild(bref);
  const links = document.createElement("p");
  links.className = "gloss-pop__links";
  const more = document.createElement("a");
  more.href = e.url;
  more.className = "gloss-pop__more";
  more.dataset.glossOpen = anchor?.dataset.gloss ?? "";
  more.textContent = EN ? "Full entry →" : "Fiche complète →";
  links.appendChild(more);
  if (e.wiki) {
    links.appendChild(document.createTextNode(" · "));
    const w = document.createElement("a");
    w.href = e.wiki;
    w.rel = "external noopener";
    w.textContent = EN ? "Wikipedia ↗" : "Wikipédia ↗";
    links.appendChild(w);
  }
  p.appendChild(links);
}

function place(a) {
  const p = ensurePop();
  const r = a.getBoundingClientRect();
  p.hidden = false;
  const w = p.offsetWidth;
  let x = r.left + window.scrollX;
  const maxX = window.scrollX + document.documentElement.clientWidth - w - 8;
  if (x > maxX) x = Math.max(window.scrollX + 8, maxX);
  p.style.left = `${x}px`;
  p.style.top = `${r.bottom + window.scrollY + 6}px`;
}

async function show(a) {
  clearTimeout(hideTimer);
  await load();
  const e = data?.[a.dataset.gloss];
  if (!e) return;
  anchor = a;
  render(e);
  place(a);
  a.setAttribute("aria-describedby", "gloss-pop");
}

function hidePop() {
  if (!pop || pop.hidden) return;
  pop.hidden = true;
  anchor?.removeAttribute("aria-describedby");
  anchor = null;
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hidePop, 220);
}

/* ——— rail latéral droit ——— */
function ensureRail() {
  if (rail) return rail;
  rail = document.createElement("aside");
  rail.className = "gloss-rail";
  rail.setAttribute("aria-label", EN ? "Glossary entry" : "Fiche du glossaire");
  rail.hidden = true;
  const head = document.createElement("div");
  head.className = "gloss-rail__head";
  const title = document.createElement("strong");
  title.className = "gloss-rail__title";
  title.textContent = EN ? "Glossary" : "Glossaire";
  const page = document.createElement("a");
  page.className = "gloss-rail__page";
  page.textContent = EN ? "Open page ↗" : "Ouvrir la page ↗";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "gloss-rail__close";
  close.setAttribute("aria-label", EN ? "Close the panel" : "Fermer le panneau");
  close.textContent = "✕";
  close.addEventListener("click", closeRail);
  head.append(title, page, close);
  const body = document.createElement("div");
  body.className = "gloss-rail__body";
  rail.append(head, body);
  document.body.appendChild(rail);
  return rail;
}

async function openRail(url, from) {
  const r = ensureRail();
  railReturnFocus = from ?? document.activeElement;
  r.querySelector(".gloss-rail__page").href = url;
  const body = r.querySelector(".gloss-rail__body");
  body.textContent = "…";
  r.hidden = false;
  hidePop();
  try {
    const html = await fetch(url).then((x) => x.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const article = doc.querySelector(".article") ?? doc.querySelector("main") ?? doc.body;
    body.replaceChildren(...Array.from(article.children).map((n) => document.importNode(n, true)));
    // Les fiches du rail ne rouvrent pas un rail : liens internes normaux.
    body.querySelectorAll("script").forEach((s) => s.remove());
  } catch {
    body.textContent = EN ? "Loading failed — open the page instead." : "Chargement impossible — ouvrez la page.";
  }
  r.querySelector(".gloss-rail__close").focus();
}

function closeRail() {
  if (!rail || rail.hidden) return;
  rail.hidden = true;
  if (railReturnFocus instanceof HTMLElement) railReturnFocus.focus();
  railReturnFocus = null;
}

/** Le clic doit-il ouvrir le rail (préférence + place disponible) ? */
function wantsRail() {
  return getPref() === "rail" && window.matchMedia(WIDE).matches;
}

/* ——— préférence dans le panneau Paramètres ——— */
function wirePref() {
  const input = document.querySelector("[data-gloss-pref]");
  if (!input) return;
  input.checked = getPref() === "rail";
  input.addEventListener("change", () => setPref(input.checked ? "rail" : "page"));
}

function init() {
  wirePref();
  if (!document.querySelector("a.gloss")) return;

  document.addEventListener("mouseover", (ev) => {
    const a = ev.target instanceof Element ? ev.target.closest("a.gloss") : null;
    if (a) show(a);
    else if (!(ev.target instanceof Element && ev.target.closest(".gloss-pop"))) scheduleHide();
  });
  document.addEventListener("focusin", (ev) => {
    const a = ev.target instanceof Element ? ev.target.closest("a.gloss") : null;
    if (a) show(a);
    else scheduleHide();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { hidePop(); closeRail(); }
  });
  document.addEventListener("click", (ev) => {
    if (!(ev.target instanceof Element)) return;
    const touch = window.matchMedia("(hover: none)").matches;
    const a = ev.target.closest("a.gloss");
    if (a) {
      // Tactile : premier appui = popup ; second = comportement normal.
      if (touch && anchor !== a) { ev.preventDefault(); show(a); return; }
      if (wantsRail()) { ev.preventDefault(); openRail(a.href, a); }
      return;
    }
    const more = ev.target.closest(".gloss-pop__more");
    if (more && wantsRail()) { ev.preventDefault(); openRail(more.href, anchor); }
  });
  window.addEventListener("scroll", () => anchor && place(anchor), { passive: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
