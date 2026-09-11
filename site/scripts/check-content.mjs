import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..", "src", "content");
const COLLECTIONS = ["cours", "miscelanea", "glossaire"];

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

const errors = [];

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
    const fr = frontmatter(frSource, `${collection}/${file}`);
    const en = frontmatter(enSource, `${collection}/en/${file}`);

    if (collection === "cours") {
      for (const name of ["order", "serie"]) {
        if (field(fr, name) !== field(en, name)) {
          errors.push(`${collection}/${file}: champ structurel « ${name} » différent entre FR et EN`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`Contrôle des contenus échoué (${errors.length} erreur${errors.length > 1 ? "s" : ""}) :`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Contenus FR/EN cohérents : fichiers appariés et métadonnées structurelles alignées.");
}
