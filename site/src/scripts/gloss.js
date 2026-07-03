/* GLOSSAIRE — popup de survol des termes auto-liés (a.gloss).
   Complète le maillage systématique du build (rehype-glossaire) :
   survol OU focus clavier → définition brève ; clic → fiche complète.
   Conforme WCAG 1.4.13 : la popup est révocable (Échap), survolable
   (on peut y déplacer le pointeur) et persistante (pas de disparition
   au bout d'un délai). Tactile : premier appui = popup, second = fiche.
   Données : /glossaire.json, généré au build, chargé au premier survol. */

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const EN = document.documentElement.lang === "en";

let data = null; // { [slug]: { t, x, angl, type, bref, url } } — locale courante
let loading = null;
let pop = null; // l'élément popup unique
let anchor = null; // le lien actuellement décrit
let hideTimer = 0;

function load() {
  if (data) return Promise.resolve(data);
  loading ??= fetch(`${BASE}/glossaire.json`)
    .then((r) => r.json())
    .then((all) => (data = EN ? all.en : all.fr))
    .catch(() => (data = {}));
  return loading;
}

function ensurePop() {
  if (pop) return pop;
  pop = document.createElement("div");
  pop.className = "gloss-pop";
  pop.id = "gloss-pop";
  pop.setAttribute("role", "tooltip");
  pop.hidden = true;
  // La popup reste ouverte tant que le pointeur est dessus (1.4.13).
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
  const head = document.createElement("p");
  head.className = "gloss-pop__head";
  const term = document.createElement("strong");
  term.textContent = e.t;
  head.appendChild(term);
  // Correspondance FR ↔ EN (anglicismes, ou terme différent dans l'autre langue).
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
  const more = document.createElement("a");
  more.href = e.url;
  more.className = "gloss-pop__more";
  more.textContent = EN ? "Full entry →" : "Fiche complète →";
  p.appendChild(more);
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

function hide() {
  if (!pop || pop.hidden) return;
  pop.hidden = true;
  anchor?.removeAttribute("aria-describedby");
  anchor = null;
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hide, 220);
}

function init() {
  const links = document.querySelectorAll("a.gloss");
  if (!links.length) return;

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
    if (ev.key === "Escape") hide();
  });
  // Tactile (pas de survol) : premier appui ouvre la popup, second navigue.
  document.addEventListener("click", (ev) => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const a = ev.target instanceof Element ? ev.target.closest("a.gloss") : null;
    if (a && anchor !== a) {
      ev.preventDefault();
      show(a);
    }
  });
  window.addEventListener("scroll", () => anchor && place(anchor), { passive: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
