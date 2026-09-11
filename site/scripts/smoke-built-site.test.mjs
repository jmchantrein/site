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
    assert.match(html, /data-settings-trigger/);
    assert.match(html, /_astro\/[^"']+\.js/);
  }
});

test("une page de cours conserve ses parcours interactifs essentiels", async () => {
  const html = await output("cours/bash-bases/index.html");
  assert.match(html, /class="exercise"/);
  assert.match(html, /data-exercise-answer/);
  assert.match(html, /class="exercise__solution"/);
  assert.match(html, /data-term-host/);
  assert.match(html, /href="\/site\/en\/cours\/bash-bases\/?"/);
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
