// Scans a built `dist/client` output for inline <script> bodies (no `src`,
// excluding JSON-LD and Partytown-typed scripts, which browsers never execute)
// and prints their CSP `sha256-` sources. Re-run after `pnpm build` whenever
// Astro or Partytown changes, and update the `script-src` hashes in
// vercel.json accordingly.
//
// Usage: node scripts/csp-hashes.mjs [dist/client]

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = process.argv[2] || "dist/client";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (entry.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = walk(root);
const scriptRe = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;
const hashes = new Map();

for (const file of files) {
  const html = readFileSync(file, "utf8");
  let m;
  while ((m = scriptRe.exec(html))) {
    const attrs = (m[1] || "").trim();
    const body = m[2];
    if (/type\s*=\s*["']application\/ld\+json["']/.test(attrs)) continue;
    if (/type\s*=\s*["']text\/partytown["']/.test(attrs)) continue;
    if (/\ssrc\s*=/.test(attrs)) continue;
    if (body.trim() === "") continue;
    const hash = createHash("sha256").update(body, "utf8").digest("base64");
    if (!hashes.has(hash)) hashes.set(hash, body.trim().slice(0, 80));
  }
}

console.log(`Scanned ${files.length} html files, found ${hashes.size} distinct inline script bodies\n`);
for (const [hash, sample] of hashes) {
  console.log(`'sha256-${hash}'  // ${sample.replace(/\s+/g, " ")}`);
}
