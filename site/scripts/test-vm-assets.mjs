import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "public", "vm");
const iso = path.join(root, "alpine", "alpine-virt-3.21.3-x86.iso");
const expected = (await readFile(`${iso}.sha256`, "utf8")).trim().split(/\s+/)[0];
const bytes = await readFile(iso);
assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
assert.ok((await stat(path.join(root, "v86.wasm"))).size > 1_000_000);
assert.ok((await stat(path.join(root, "libv86.js"))).size > 100_000);
assert.ok((await stat(path.join(root, "seabios.bin"))).size > 100_000);
const debian = path.join(root, "debian");
const hasDebian = await access(path.join(debian, "SHA256SUMS")).then(() => true, () => false);
if (hasDebian) for (const name of ["bzImage", "initrd.gz"]) assert.ok((await stat(path.join(debian, name))).size > 1_000_000);
console.log(`VM assets: local Alpine${hasDebian ? " and Debian" : ""} images and v86 runtime are coherent.`);
