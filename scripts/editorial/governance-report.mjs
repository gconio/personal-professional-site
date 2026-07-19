import fs from "node:fs";
import path from "node:path";
import { COLLECTIONS, ROOT, loadCollections } from "./lib.mjs";

const OUTPUT_DIR = path.join(ROOT, "artifacts", "editorial");
const JSON_OUTPUT = path.join(OUTPUT_DIR, "editorial-governance-report.json");
const MARKDOWN_OUTPUT = path.join(OUTPUT_DIR, "EDITORIAL_GOVERNANCE_REPORT.md");

const DAY_MS = 86_400_000;
const asOfInput = process.env.EDITORIAL_AS_OF_DATE || new Date().toISOString().slice(0, 10);
const asOf = new Date(`${asOfInput}T00:00:00.000Z`);
if (Number.isNaN(asOf.getTime())) {
  console.error(`EDITORIAL_AS_OF_DATE non valida: ${asOfInput}. Usa YYYY-MM-DD.`);
  process.exit(1);
}

const POLICY = {
  corsi: { currentDays: 365, reviewDays: 730, source: ["lastReviewed"] },
  pubblicazioni: { currentDays: 3650, reviewDays: 7300, source: ["lastReviewed", "visibleFrom", "year"] },
  risorse: { currentDays: 730, reviewDays: 1460, source: ["lastReviewed", "year"] },
  media: { currentDays: 548, reviewDays: 1095, source: ["lastReviewed", "date"] }
};

function parseDateLike(value, field) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  if (field === "year") {
    const year = Number(value);
    if (!Number.isInteger(year) || year < 1900 || year > 3000) return null;
    return new Date(Date.UTC(year, 6, 1));
  }
  const raw = String(value).trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveReference(record) {
  const policy = POLICY[record.collection];
  for (const field of policy.source) {
    const date = parseDateLike(record.data[field], field);
    if (date) return { field, date };
  }
  return { field: null, date: null };
}

function classify(record) {
  const policy = POLICY[record.collection];
  const reference = resolveReference(record);
  if (!reference.date) {
    return {
      status: "undated",
      priority: record.collection === "corsi" ? "P1" : "P2",
      referenceField: null,
      referenceDate: null,
      ageDays: null,
      reason: "Nessuna data di revisione o data editoriale utilizzabile."
    };
  }

  const ageDays = Math.max(0, Math.floor((asOf - reference.date) / DAY_MS));
  if (ageDays <= policy.currentDays) {
    return { status: "current", priority: "P3", referenceField: reference.field, referenceDate: reference.date.toISOString().slice(0, 10), ageDays, reason: "Entro la soglia di aggiornamento corrente." };
  }
  if (ageDays <= policy.reviewDays) {
    return { status: "review-due", priority: "P2", referenceField: reference.field, referenceDate: reference.date.toISOString().slice(0, 10), ageDays, reason: "Superata la soglia corrente; revisione editoriale consigliata." };
  }
  return { status: "stale", priority: "P1", referenceField: reference.field, referenceDate: reference.date.toISOString().slice(0, 10), ageDays, reason: "Superata la soglia massima prevista dalla policy." };
}

function increment(bucket, key) {
  if (key === undefined || key === null || String(key).trim() === "") return;
  const normalized = String(key).trim();
  bucket[normalized] = (bucket[normalized] ?? 0) + 1;
}

function sortedObject(value) {
  return Object.fromEntries(Object.entries(value).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "it")));
}

const records = loadCollections();
const items = records.map((record) => ({
  collection: record.collection,
  file: record.relativeFile,
  slug: record.slug,
  title: record.data.title ?? "",
  category: record.data.category ?? "",
  type: record.data.type ?? "",
  year: record.data.year ?? null,
  featured: record.data.featured ?? false,
  ...classify(record)
}));

const statusTotals = { current: 0, "review-due": 0, stale: 0, undated: 0 };
const priorityTotals = { P0: 0, P1: 0, P2: 0, P3: 0 };
const byCollection = {};
const coverage = { categories: {}, types: {}, years: {}, featured: {} };

for (const item of items) {
  statusTotals[item.status] += 1;
  priorityTotals[item.priority] += 1;
  byCollection[item.collection] ??= { total: 0, statuses: { current: 0, "review-due": 0, stale: 0, undated: 0 }, priorities: { P0: 0, P1: 0, P2: 0, P3: 0 } };
  byCollection[item.collection].total += 1;
  byCollection[item.collection].statuses[item.status] += 1;
  byCollection[item.collection].priorities[item.priority] += 1;
  increment(coverage.categories, item.category);
  increment(coverage.types, item.type);
  increment(coverage.years, item.year);
  increment(coverage.featured, item.featured ? "featured" : "standard");
}

const actionQueue = items
  .filter((item) => item.priority === "P1" || item.priority === "P2")
  .sort((a, b) => a.priority.localeCompare(b.priority) || (b.ageDays ?? -1) - (a.ageDays ?? -1) || a.title.localeCompare(b.title, "it"));

const report = {
  generatedAt: new Date().toISOString(),
  asOfDate: asOfInput,
  version: "0.4.0",
  policy: POLICY,
  summary: {
    records: items.length,
    collections: Object.keys(COLLECTIONS).length,
    statuses: statusTotals,
    priorities: priorityTotals,
    actionQueue: actionQueue.length
  },
  byCollection,
  coverage: {
    categories: sortedObject(coverage.categories),
    types: sortedObject(coverage.types),
    years: sortedObject(coverage.years),
    featured: sortedObject(coverage.featured)
  },
  actionQueue,
  items
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(JSON_OUTPUT, JSON.stringify(report, null, 2) + "\n", "utf8");

const lines = [
  "# Editorial Governance Report",
  "",
  `Generato: ${report.generatedAt}`,
  `Data di riferimento: ${report.asOfDate}`,
  "",
  "## Sintesi",
  "",
  `- Contenuti analizzati: ${report.summary.records}`,
  `- Collezioni: ${report.summary.collections}`,
  `- Current: ${statusTotals.current}`,
  `- Review due: ${statusTotals["review-due"]}`,
  `- Stale: ${statusTotals.stale}`,
  `- Undated: ${statusTotals.undated}`,
  `- Coda operativa P1/P2: ${report.summary.actionQueue}`,
  "",
  "## Stato per collezione",
  "",
  "| Collezione | Totale | Current | Review due | Stale | Undated | P1 | P2 | P3 |",
  "|---|---:|---:|---:|---:|---:|---:|---:|---:|"
];

for (const collection of Object.keys(COLLECTIONS)) {
  const entry = byCollection[collection] ?? { total: 0, statuses: statusTotals, priorities: priorityTotals };
  lines.push(`| ${collection} | ${entry.total} | ${entry.statuses.current} | ${entry.statuses["review-due"]} | ${entry.statuses.stale} | ${entry.statuses.undated} | ${entry.priorities.P1} | ${entry.priorities.P2} | ${entry.priorities.P3} |`);
}

lines.push("", "## Coda operativa", "");
if (!actionQueue.length) {
  lines.push("Nessun contenuto classificato P1 o P2.");
} else {
  for (const item of actionQueue) {
    const date = item.referenceDate ? `${item.referenceDate} (${item.referenceField})` : "data assente";
    lines.push(`- **${item.priority} · ${item.status}** — **${item.title}** — \`${item.file}\` — ${date}. ${item.reason}`);
  }
}

lines.push("", "## Copertura", "", "### Categorie", "");
for (const [name, count] of Object.entries(report.coverage.categories)) lines.push(`- ${name}: ${count}`);
lines.push("", "### Tipologie", "");
for (const [name, count] of Object.entries(report.coverage.types)) lines.push(`- ${name}: ${count}`);
lines.push("", "### Anni", "");
for (const [name, count] of Object.entries(report.coverage.years)) lines.push(`- ${name}: ${count}`);
lines.push("");

fs.writeFileSync(MARKDOWN_OUTPUT, lines.join("\n"), "utf8");

console.log(`Governance report JSON: ${path.relative(ROOT, JSON_OUTPUT)}`);
console.log(`Governance report Markdown: ${path.relative(ROOT, MARKDOWN_OUTPUT)}`);
console.log(`Esito: ${items.length} contenuti; ${statusTotals.current} current, ${statusTotals["review-due"]} review-due, ${statusTotals.stale} stale, ${statusTotals.undated} undated.`);
