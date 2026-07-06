import type { APIRoute } from "astro";

/** PROMPT-CADRE « ARTEFACT » — à coller dans un LLM (Claude, artifacts,
    Claude Design…) pour produire une création interactive directement
    intégrable au site via <Artefact> (cf. § 11 de la page Système).
    Servi en texte brut, comme le prompt de rédaction MDX. */
const PROMPT = `Tu vas produire un ARTEFACT PÉDAGOGIQUE INTERACTIF destiné à être intégré
dans un site de cours statique, à l'intérieur d'une iframe sandboxée
(sandbox="allow-scripts"). Respecte STRICTEMENT les contraintes suivantes.

## Livrable

- UN SEUL fichier HTML autonome (index.html) : tout le CSS dans <style>,
  tout le JS dans <script>, aucun fichier annexe sauf nécessité absolue.
- AUCUNE ressource externe : pas de CDN, pas de police distante, pas de
  fetch/XHR vers l'extérieur, pas d'analytics. Tout est inliné.
- Pas de localStorage, pas de cookies (la sandbox les bloque de toute
  façon) : l'état vit en mémoire, la page doit être rechargeable sans perte
  de sens.

## Rendu et intégration

- L'artefact remplit TOUTE la fenêtre (html, body { margin: 0; height: 100% })
  et s'adapte à la largeur disponible (responsive, min 320 px de large).
  Il sera affiché dans un cadre d'environ 480 px de haut (précisable).
- Fond clair par défaut ; si tu gères le sombre, utilise
  prefers-color-scheme, jamais un bouton de thème local.
- Typographie système (system-ui, sans-serif) — pas de police embarquée.
- Esthétique SOBRE et fonctionnelle : pas de décor gratuit, pas de dégradés
  criards ; chaque élément visuel doit servir la compréhension.

## Pédagogie

- L'artefact illustre UNE idée, annoncée en une phrase visible en haut.
- Interactions simples et guidées : boutons explicites, étiquettes claires,
  états nommés — l'utilisateurice ne doit jamais se demander quoi faire.
- Chaque élément manipulable a une étiquette texte (pas d'icône seule).

## Accessibilité (non négociable)

- Contrastes AA minimum (4,5:1 pour le texte).
- Tout est utilisable au clavier (focus visible, ordre logique, boutons
  <button>, pas de div cliquables).
- alt/aria-label sur tout élément non textuel porteur de sens.
- Les animations respectent prefers-reduced-motion (version statique ou
  bascule instantanée).
- L'information n'est jamais portée par la couleur seule.

## Langue

- Par défaut en FRANÇAIS ; je demanderai ensuite une variante anglaise
  (fichier séparé) si besoin.

Quand tu as compris ces contraintes, demande-moi ce que l'artefact doit
montrer (le concept, les étapes, les interactions attendues), puis produis
le fichier complet.`;

export const GET: APIRoute = () =>
  new Response(PROMPT, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
