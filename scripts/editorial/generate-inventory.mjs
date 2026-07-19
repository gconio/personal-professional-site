import fs from "node:fs";
import path from "node:path";
import { COLLECTIONS, ROOT, loadCollections, normalize } from "./lib.mjs";

const outputDir = path.join(ROOT, "artifacts", "editorial");
fs.mkdirSync(outputDir, { recursive: true });

const records = loadCollections();
const inventory = {
  generatedAt: new Date().toISOString(),
  schemaVersion: "0.2",
  totals: {},
  collections: {},
  facets: {
    tags: {},
    categories: {},
    types: {},
    institutions: {}
  }
};

function increment(bucket, value) {
  if (value === undefined || value === null || String(value).trim() === "") return;
  const key = String(value).trim();
  bucket[key] = (bucket[key] ?? 0) + 1;
}

for (const collection of Object.keys(COLLECTIONS)) {
  const entries = records
    .filter((record) => record.collection === collection)
    .map((record) => ({
      slug: record.slug,
      file: record.relativeFile,
      title: record.data.title ?? "",
      description: record.data.description ?? "",
      type: record.data.type ?? "",
      category: record.data.category ?? "",
      year: record.data.year ?? null,
      date: record.data.date ?? null,
      link: record.data.link ?? record.data.externalUrl ?? "",
      tags: Array.isArray(record.data.tags) ? record.data.tags : [],
      featured: record.data.featured ?? false,
      order: record.data.order ?? 99,
      searchKey: normalize(
        [
          record.data.title,
          record.data.description,
          record.data.type,
          record.data.category,
          ...(Array.isArray(record.data.tags) ? record.data.tags : [])
        ].join(" ")
      )
    }))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "it"));

  inventory.collections[collection] = entries;
  inventory.totals[collection] = entries.length;

  for (const entry of entries) {
    for (const tag of entry.tags) increment(inventory.facets.tags, tag);
    increment(inventory.facets.categories, entry.category);
    increment(inventory.facets.types, entry.type);
  }
}

for (const record of records) {
  increment(inventory.facets.institutions, record.data.institution);
  increment(inventory.facets.institutions, record.data.publisher);
  increment(inventory.facets.institutions, record.data.source);
}

const jsonFile = path.join(outputDir, "editorial-index.json");
fs.writeFileSync(jsonFile, JSON.stringify(inventory, null, 2) + "\n", "utf8");

const lines = [
  "# Lab4Int Editorial Inventory",
  "",
  `Generato: ${inventory.generatedAt}`,
  "",
  "## Totali",
  "",
  "| Collezione | Contenuti |",
  "|---|---:|",
  ...Object.entries(inventory.totals).map(([name, total]) => `| ${name} | ${total} |`),
  "",
  "## Contenuti",
  ""
];

for (const [collection, entries] of Object.entries(inventory.collections)) {
  lines.push(`### ${collection}`, "");
  for (const entry of entries) {
    lines.push(`- **${entry.title}** — \`${entry.slug}\``);
  }
  lines.push("");
}

const markdownFile = path.join(outputDir, "CONTENT_INVENTORY.md");
fs.writeFileSync(markdownFile, lines.join("\n") + "\n", "utf8");

console.log(`Inventario generato: ${path.relative(ROOT, jsonFile)}`);
console.log(`Report generato: ${path.relative(ROOT, markdownFile)}`);
