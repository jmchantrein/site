import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { load as parseYaml } from "js-yaml";
import { GLOSSAIRE, GLOSSAIRE_BY_SLUG } from "../src/data/glossaire.mjs";
import { TERMINAL_KEYS } from "../src/data/terminal-keys.mjs";

const ROOT = path.resolve(import.meta.dirname, "..", "src", "content");
const COLLECTIONS = ["cours", "miscelanea", "glossaire", "ressources"];

async function mdxFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name)
    .sort();
}

function frontmatter(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)---(?:\r?\n|$)/);
  if (!match) throw new Error(`${file}: frontmatter absent ou illisible`);
  return match[1];
}

function field(block, name) {
  return block.match(new RegExp(`^${name}:\\s*["']?([^"'\\n]+)`, "m"))?.[1]?.trim();
}

function checkConflictMarkers(source, file) {
  if (/^(?:<{7}|={7}|>{7})(?: .*)?$/m.test(source)) {
    errors.push(`${file}: marqueur de conflit Git non résolu`);
  }
}

const errors = [];
const courseIds = new Set(await mdxFiles(path.join(ROOT, "cours")).then((files) => files.map((file) => file.replace(/\.mdx$/, ""))));
const referencedGlossary = new Set();

for (const collection of COLLECTIONS) {
  const frDir = path.join(ROOT, collection);
  const enDir = path.join(frDir, "en");
  const [frFiles, enFiles] = await Promise.all([mdxFiles(frDir), mdxFiles(enDir)]);

  for (const file of frFiles.filter((name) => !enFiles.includes(name))) {
    errors.push(`${collection}/${file}: traduction EN manquante`);
  }
  for (const file of enFiles.filter((name) => !frFiles.includes(name))) {
    errors.push(`${collection}/en/${file}: source FR manquante`);
  }

  for (const file of frFiles.filter((name) => enFiles.includes(name))) {
    const [frSource, enSource] = await Promise.all([
      readFile(path.join(frDir, file), "utf8"),
      readFile(path.join(enDir, file), "utf8"),
    ]);
    checkConflictMarkers(frSource, `${collection}/${file}`);
    checkConflictMarkers(enSource, `${collection}/en/${file}`);
    const fr = frontmatter(frSource, `${collection}/${file}`);
    const en = frontmatter(enSource, `${collection}/en/${file}`);

    for (const [source, label] of [[frSource, `${collection}/${file}`], [enSource, `${collection}/en/${file}`]]) {
      for (const match of source.matchAll(/<G\s+[^>]*?t=["']([^"']+)["']/g)) {
        if (!GLOSSAIRE_BY_SLUG[match[1]]) errors.push(`${label}: <G> pointe vers le slug inconnu « ${match[1]} »`);
      }
      for (const match of source.matchAll(/<TermKey\s+[^>]*?stroke=["']([^"']+)["']/g)) {
        if (!TERMINAL_KEYS[match[1]]) errors.push(`${label}: <TermKey> utilise la touche inconnue « ${match[1]} »`);
      }
    }

    if (collection !== "glossaire") {
      for (const entry of GLOSSAIRE) {
        const forms = [entry.fr, ...(entry.aliasFr ?? []), entry.en, ...(entry.aliasEn ?? [])];
        if (forms.some((form) => form && frSource.toLocaleLowerCase("fr").includes(form.toLocaleLowerCase("fr")))) {
          referencedGlossary.add(entry.slug);
        }
      }
    }

    if (collection === "cours") {
      for (const name of ["order", "serie"]) {
        if (field(fr, name) !== field(en, name)) {
          errors.push(`${collection}/${file}: champ structurel « ${name} » différent entre FR et EN`);
        }
      }
      const serie = field(fr, "serie");
      if (!serie) {
        if (!/^provenance:\s*$/m.test(fr) || !/^\s+aiShare:\s*(?:100|\d{1,2})\s*$/m.test(fr)) {
          errors.push(`${collection}/${file}: cours autonome sans provenance et aiShare explicites`);
        }
        if (!/^provenance:\s*$/m.test(en) || !/^\s+aiShare:\s*(?:100|\d{1,2})\s*$/m.test(en)) {
          errors.push(`${collection}/en/${file}: cours autonome sans provenance et aiShare explicites`);
        }
      }
    }

    if (collection === "ressources") {
      const frData = parseYaml(fr);
      const enData = parseYaml(en);
      const structural = ["kind", "added", "year", "duration", "languages", "subtitles", "translations", "topics", "editorialStatus", "youtubeId", "playlistId", "channel", "playlists", "related", "draft"];
      for (const name of structural) {
        if (JSON.stringify(frData[name] ?? null) !== JSON.stringify(enData[name] ?? null)) {
          errors.push(`${collection}/${file}: champ structurel « ${name} » différent entre FR et EN`);
        }
      }
      const frLinks = (frData.links ?? []).map(({ role, url }) => ({ role, url }));
      const enLinks = (enData.links ?? []).map(({ role, url }) => ({ role, url }));
      if (JSON.stringify(frLinks) !== JSON.stringify(enLinks)) {
        errors.push(`${collection}/${file}: URLs ou rôles des liens différents entre FR et EN`);
      }
    }
  }
}

const resourceDir = path.join(ROOT, "ressources");
const resourceFiles = await mdxFiles(resourceDir);
const resources = new Map();
const externalKeys = new Map();
for (const file of resourceFiles) {
  const source = await readFile(path.join(resourceDir, file), "utf8");
  const data = parseYaml(frontmatter(source, `ressources/${file}`));
  const slug = file.replace(/\.mdx$/, "");
  resources.set(slug, data);
  const keys = [
    data.youtubeId && `youtube:${data.youtubeId}`,
    data.playlistId && `playlist:${data.playlistId}`,
    ...(data.links ?? []).map(({ url }) => `url:${url}`),
  ].filter(Boolean);
  for (const key of keys) {
    if (externalKeys.has(key)) errors.push(`ressources/${file}: ressource externe déjà utilisée par « ${externalKeys.get(key)} » (${key})`);
    else externalKeys.set(key, slug);
  }
}
for (const [slug, data] of resources) {
  const refs = [data.channel, ...(data.playlists ?? []), ...(data.related ?? [])].filter(Boolean);
  for (const ref of refs) if (!resources.has(ref)) errors.push(`ressources/${slug}: relation vers le slug inconnu « ${ref} »`);
  if (data.channel && resources.get(data.channel)?.kind !== "channel") errors.push(`ressources/${slug}: « channel » doit pointer vers une chaîne`);
  for (const ref of data.playlists ?? []) if (resources.get(ref)?.kind !== "playlist") errors.push(`ressources/${slug}: « playlists » doit pointer vers une playlist`);
  if ((data.related ?? []).includes(slug) || data.channel === slug || (data.playlists ?? []).includes(slug)) errors.push(`ressources/${slug}: relation circulaire directe`);
}

for (const entry of GLOSSAIRE) {
  const taught = Array.isArray(entry.cours) ? entry.cours : entry.cours ? [entry.cours] : [];
  for (const id of taught) {
    if (!courseIds.has(id)) errors.push(`glossaire/${entry.slug}: module « ${id} » déclaré dans cours mais introuvable`);
  }
  // Une référence effectivement repérée alimentera le bloc « Cité dans » de sa fiche.
  // Les entrées non encore citées restent autorisées (elles peuvent préparer un cours).
  if (referencedGlossary.has(entry.slug) && !GLOSSAIRE_BY_SLUG[entry.slug]) {
    errors.push(`glossaire/${entry.slug}: référence citée sans fiche générable`);
  }
}

if (errors.length) {
  console.error(`Contrôle des contenus échoué (${errors.length} erreur${errors.length > 1 ? "s" : ""}) :`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Contenus cohérents : parité FR/EN, glossaire, recommandations, liens retour et provenance des cours contrôlés.");
}
