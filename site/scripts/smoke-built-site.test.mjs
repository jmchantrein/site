import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const DIST = path.resolve(import.meta.dirname, "..", "dist");

async function output(relative) {
  return readFile(path.join(DIST, relative), "utf8");
}

test("les pages représentatives contiennent le chrome et les scripts interactifs", async () => {
  for (const page of ["index.html", "cours/bash-bases/index.html", "en/cours/bash-bases/index.html"]) {
    const html = await output(page);
    assert.match(html, /<main\b/);
    assert.match(html, /class="site-header"/);
    assert.match(html, /data-search-trigger/);
    assert.match(html, /Préférences de lecture/);
    assert.doesNotMatch(html, /data-settings-trigger/);
    assert.match(html, /_astro\/[^"']+\.js/);
  }
});

test("l'en-tête propose directement le terminal, sans menu d'outils ni Pomodoro", async () => {
  const html = await output("index.html");
  const apps = [...html.matchAll(/data-dock-app="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual([...new Set(apps)].sort(), ["terminal"]);
  assert.doesNotMatch(html, /Pomodoro|>Outils<|>Tools</);
  assert.doesNotMatch(html, /data-pastime/);
});

test("une page de cours conserve ses parcours interactifs essentiels", async () => {
  const html = await output("cours/bash-bases/index.html");
  assert.match(html, /class="exercise"/);
  assert.match(html, /data-exercise-answer/);
  assert.match(html, /class="exercise__solution"/);
  assert.match(html, /data-term-host/);
  assert.match(html, /href="\/site\/en\/cours\/bash-bases\/?"/);
});

test("les vidéos sont embarquées directement à la largeur de leur colonne", async () => {
  for (const page of ["cours/ia-apprentissage/index.html", "en/cours/ia-apprentissage/index.html"]) {
    const html = await output(page);
    const embed = html.match(/<figure class="video-embed"[\s\S]*?<\/figure>/)?.[0];

    assert.ok(embed, "le lecteur vidéo doit être rendu");
    assert.match(embed, /data-video-id="4xq6bVbS-Pw"/);
    assert.match(embed, /<iframe[^>]+src="https:\/\/www\.youtube-nocookie\.com\/embed\/4xq6bVbS-Pw\?rel=0"/);
    assert.doesNotMatch(embed, /href="https:\/\/www\.youtube\.com/);
  }
});

test("chaque page de cours affiche sa jauge de provenance humain / IA", async () => {
  for (const locale of ["", "en/"]) {
    const root = path.join(DIST, locale, "cours");
    const entries = await (await import("node:fs/promises")).readdir(root, { withFileTypes: true });
    for (const entry of entries.filter((item) => item.isDirectory() && item.name !== "serie")) {
      const html = await readFile(path.join(root, entry.name, "index.html"), "utf8");
      assert.match(html, /class="prov__gauge"/, `${locale}cours/${entry.name} doit afficher une jauge`);
    }
  }
});

test("le glossaire expose sa navigation, ses ressources et les liens retour", async () => {
  const [index, englishIndex, entry] = await Promise.all([
    output("glossaire/index.html"),
    output("en/glossaire/index.html"),
    output("glossaire/alan-turing/index.html"),
  ]);
  assert.match(index, /aria-label="Sections du glossaire"/);
  assert.match(index, /id="videos"/);
  assert.match(index, /id="ressources"/);
  assert.match(index, /glossaire\/ia-generative\/[\s\S]*?cité dans[\s\S]*?cours\/ia-apprentissage\//);
  assert.match(index, /glossaire\/alan-turing\/[\s\S]*?cité dans[\s\S]*?cours\/ia-apprentissage\//);
  assert.match(englishIndex, /glossaire\/ia-generative\/[\s\S]*?cited in[\s\S]*?en\/cours\/ia-apprentissage\//);
  assert.match(englishIndex, /glossaire\/alan-turing\/[\s\S]*?cited in[\s\S]*?en\/cours\/ia-apprentissage\//);
  assert.match(entry, /id="cite-dans"/);
  assert.match(entry, /cours\/ia-apprentissage\//);
});

test("le sommaire mobile est navigable dans le HTML rendu au build", async () => {
  const html = await output("cours/bash-bases/index.html");
  const mobileToc = html.match(/<details class="toc-m"[^>]*>[\s\S]*?<\/details>/)?.[0];

  assert.ok(mobileToc, "le sommaire mobile doit exister sans exécution de JavaScript");
  assert.match(mobileToc, /<summary[^>]*>Sommaire<\/summary>/);
  assert.match(mobileToc, /href="#introduction"/);
});

test("les index générés sont lisibles et préfixés pour GitHub Pages", async () => {
  const search = JSON.parse(await output("search-index.json"));
  const glossary = JSON.parse(await output("glossaire.json"));
  assert.ok(search.length > 0, "l’index de recherche ne doit pas être vide");
  assert.ok(Object.keys(glossary.fr ?? {}).length > 0, "l’index FR du glossaire ne doit pas être vide");
  assert.ok(Object.keys(glossary.en ?? {}).length > 0, "l’index EN du glossaire ne doit pas être vide");
  assert.ok(search.every((entry) => entry.page.startsWith("/site/")));
});

test("les métadonnées bilingues pointent vers les routes correspondantes", async () => {
  const [fr, en] = await Promise.all([
    output("cours/bash-bases/index.html"),
    output("en/cours/bash-bases/index.html"),
  ]);
  assert.match(fr, /hreflang="en" href="https:\/\/jmchantrein\.github\.io\/site\/en\/cours\/bash-bases\/?"/);
  assert.match(en, /hreflang="fr" href="https:\/\/jmchantrein\.github\.io\/site\/cours\/bash-bases\/?"/);
});

test("la navigation anglaise reste dans son espace localisé", async () => {
  const [home, course] = await Promise.all([
    output("en/index.html"),
    output("en/cours/bash-bases/index.html"),
  ]);

  for (const html of [home, course]) {
    assert.match(html, /class="brand" href="\/site\/en\/"/);
    assert.match(html, /href="\/site\/en\/aide\/"/);
    assert.match(html, /href="\/site\/en\/systeme\/"/);
  }
  assert.doesNotMatch(home, /href="\/site\/en\/" aria-current="page"/);
  assert.match(course, /href="\/site\/en\/cours\/" aria-current="page"/);
  assert.match(home, /href="\/site\/en\/systeme\/"/);
});
