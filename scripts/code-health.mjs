#!/usr/bin/env node
// Lightweight code-health report. Counts lines, files, routes, stores,
// largest files. Zero deps — uses only node's fs/path.
//
// Run:  npm run code:health

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
]);

const SOURCE_EXT = new Set([".ts", ".tsx"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function loc(path) {
  return readFileSync(path, "utf8").split("\n").length;
}

const files = walk(SRC).filter((f) => SOURCE_EXT.has("." + f.split(".").pop()));

const totalLines = files.reduce((s, f) => s + loc(f), 0);

const byFolder = {};
for (const f of files) {
  const rel = relative(SRC, f);
  const top = rel.split(sep)[0];
  const sub = rel.split(sep).slice(0, 2).join("/");
  byFolder[top] ??= 0;
  byFolder[top] += loc(f);
  byFolder[sub] ??= 0;
  byFolder[sub] += loc(f);
}

const ranked = files
  .map((f) => ({ path: relative(ROOT, f), lines: loc(f) }))
  .sort((a, b) => b.lines - a.lines);

const routes = files
  .filter((f) => f.endsWith("page.tsx") && f.includes(`${sep}app${sep}`))
  .map((f) => {
    const rel = relative(join(SRC, "app"), f).replace(/\\/g, "/");
    return "/" + rel.replace(/\/page\.tsx$/, "").replace(/^page\.tsx$/, "");
  })
  .sort();

const stores = files.filter((f) => f.includes(`${sep}lib${sep}store${sep}`));
const components = files.filter((f) => f.includes(`${sep}components${sep}`));

const mockData = files.find((f) => f.endsWith("mock-data.ts"));
const mockLines = mockData ? loc(mockData) : 0;

function fmt(n) {
  return n.toLocaleString();
}

console.log("");
console.log("Arsemia code-health report");
console.log("==========================");
console.log("");
console.log(`Total source files            ${fmt(files.length)}`);
console.log(`Total lines of code           ${fmt(totalLines)}`);
console.log(`Routes                        ${fmt(routes.length)}`);
console.log(`Stores                        ${fmt(stores.length)}`);
console.log(`Component files               ${fmt(components.length)}`);
if (mockData) {
  const pct = ((mockLines / totalLines) * 100).toFixed(1);
  console.log(`Mock data (mock-data.ts)      ${fmt(mockLines)} lines (${pct}% of repo)`);
}
console.log("");

console.log("LOC by folder (top-level + lib/*)");
console.log("---------------------------------");
const folderEntries = Object.entries(byFolder).sort((a, b) => b[1] - a[1]);
for (const [name, n] of folderEntries.slice(0, 14)) {
  console.log(`  ${name.padEnd(28)} ${fmt(n)}`);
}
console.log("");

console.log("Top 20 largest files");
console.log("--------------------");
for (const r of ranked.slice(0, 20)) {
  console.log(`  ${String(r.lines).padStart(5)}  ${r.path}`);
}
console.log("");

console.log(`Routes (${routes.length})`);
console.log("------");
for (const r of routes) console.log(`  ${r}`);
console.log("");

console.log(`Stores (${stores.length})`);
console.log("------");
for (const s of stores) console.log(`  ${relative(ROOT, s)}`);
console.log("");

// Possible dead files: files not imported anywhere
const allSrc = files.map((f) => ({ path: f, body: readFileSync(f, "utf8") }));
const imports = new Set();
for (const { body } of allSrc) {
  const re = /from\s+["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(body))) imports.add(m[1]);
}
const possibleDead = files.filter((f) => {
  // Skip route entries (Next discovers them by filesystem)
  if (f.endsWith("page.tsx") || f.endsWith("layout.tsx") || f.endsWith("route.ts")) return false;
  const noExt = relative(SRC, f).replace(/\\/g, "/").replace(/\.(tsx?|ts)$/, "");
  const aliased = `@/${noExt}`;
  for (const im of imports) {
    if (im === aliased || im.endsWith(noExt) || im === aliased.replace(/\/index$/, "")) {
      return false;
    }
  }
  return true;
});

console.log(`Possibly unused (${possibleDead.length})`);
console.log("------------------");
if (possibleDead.length === 0) {
  console.log("  none detected");
} else {
  for (const f of possibleDead.slice(0, 20))
    console.log(`  ${relative(ROOT, f)}`);
  if (possibleDead.length > 20)
    console.log(`  ...and ${possibleDead.length - 20} more`);
}
console.log("");
