import fs from "node:fs";
import path from "node:path";
import {
  COLLECTIONS,
  PUBLIC_ROOT,
  ROOT,
  extractMarkdownLinks,
  isExternalUrl,
  isLocalPublicReference,
  loadCollections,
  localReferenceToFile
} from "./lib.mjs";

const OUTPUT_DIR = path.join(ROOT, "artifacts", "editorial");
const JSON_OUTPUT = path.join(OUTPUT_DIR, "editorial-quality-report.json");
const MARKDOWN_OUTPUT = path.join(OUTPUT_DIR, "EDITORIAL_QUALITY_REPORT.md");

const records = loadCollections();
const findings = [];

function add(severity, code, record, message, field = "") {
  findings.push({
    severity,
    code,
    collection: record.collection,
    file: record.relativeFile,
    slug: record.slug,
    field,
    message
  });
}

function textLength(value) {
  return [...String(value ?? "").trim()].length;
}

function checkTextRange(record, field, min, max, label = field) {
  const value = record.data[field];
  if (value === undefined || value === null || String(value).trim() === "") return;
  const length = textLength(value);
  if (length < min) {
    add("warning", `${field.toUpperCase()}_SHORT`, record, `${label} breve: ${length} caratteri; soglia consigliata ${min}-${max}.`, field);
  } else if (length > max) {
    add("warning", `${field.toUpperCase()}_LONG`, record, `${label} lungo: ${length} caratteri; soglia consigliata ${min}-${max}.`, field);
  }
}

function checkSlug(record) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
    add("error", "SLUG_INVALID", record, "Lo slug deve contenere solo lettere minuscole ASCII, numeri e trattini.", "slug");
  }
  if (record.slug.length > 70) {
    add("warning", "SLUG_LONG", record, `Slug lungo: ${record.slug.length} caratteri; soglia consigliata <= 70.`, "slug");
  }
}

function assetKind(file) {
  const ext = path.extname(file).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"].includes(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  return "other";
}

function checkAsset(record, field, value) {
  if (!value || !isLocalPublicReference(value)) return;
  const file = localReferenceToFile(value);
  if (!fs.existsSync(file)) return; // already blocking in v0.2.1 validator

  const kind = assetKind(file);
  const size = fs.statSync(file).size;
  const expectedPdf = /pdf/i.test(field);
  const expectedImage = ["cover", "formatsImage", "thumbnail"].includes(field);

  if (expectedPdf && kind !== "pdf") {
    add("error", "ASSET_TYPE_MISMATCH", record, `${field} deve puntare a un PDF: ${value}`, field);
  }
  if (expectedImage && kind !== "image") {
    add("error", "ASSET_TYPE_MISMATCH", record, `${field} deve puntare a un'immagine: ${value}`, field);
  }
  if (kind === "image" && size > 1_500_000) {
    add("warning", "IMAGE_HEAVY", record, `Immagine pesante (${(size / 1_000_000).toFixed(2)} MB): ${value}`, field);
  }
  if (kind === "pdf" && size > 8_000_000) {
    add("warning", "PDF_HEAVY", record, `PDF pesante (${(size / 1_000_000).toFixed(2)} MB): ${value}`, field);
  }
}

for (const record of records) {
  const { data } = record;
  checkSlug(record);
  checkTextRange(record, "title", 20, 70, "Titolo");
  checkTextRange(record, "description", 100, 180, "Descrizione");

  const currentYear = new Date().getUTCFullYear();
  if (data.year !== undefined && (data.year < 1900 || data.year > currentYear + 1)) {
    add("error", "YEAR_IMPLAUSIBLE", record, `Anno non plausibile: ${data.year}.`, "year");
  }

  if (record.collection === "corsi" && (!Array.isArray(data.audience) || data.audience.length === 0)) {
    add("warning", "AUDIENCE_EMPTY", record, "Audience non valorizzata.", "audience");
  }

  if (record.collection === "pubblicazioni") {
    if (!data.cover) add("warning", "COVER_MISSING", record, "Copertina/thumbnail non valorizzata.", "cover");
    if (!data.pdfUrl && !data.link) add("warning", "PUBLICATION_DESTINATION_MISSING", record, "La pubblicazione non ha né pdfUrl né link esterno.");
  }

  if (record.collection === "risorse") {
    if (!data.link) add("warning", "RESOURCE_LINK_MISSING", record, "La risorsa non ha un link esterno.", "link");
    if (data.link && !String(data.link).startsWith("https://")) {
      add("warning", "RESOURCE_LINK_NOT_HTTPS", record, `Link non HTTPS: ${data.link}`, "link");
    }
  }

  if (record.collection === "media") {
    if (!data.thumbnail) add("warning", "THUMBNAIL_MISSING", record, "Thumbnail non valorizzata.", "thumbnail");
    if (data.youtubeId && !/^[A-Za-z0-9_-]{11}$/.test(String(data.youtubeId))) {
      add("error", "YOUTUBE_ID_INVALID", record, `youtubeId non valido: ${data.youtubeId}`, "youtubeId");
    }
  }

  const schema = COLLECTIONS[record.collection];
  for (const field of schema.assetFields ?? []) checkAsset(record, field, data[field]);

  for (const value of extractMarkdownLinks(record.body)) {
    if (isLocalPublicReference(value)) checkAsset(record, "body", value);
    if (isExternalUrl(value) && /^http:\/\//i.test(value)) {
      add("warning", "BODY_LINK_NOT_HTTPS", record, `Collegamento nel corpo non HTTPS: ${value}`, "body");
    }
  }
}

const severities = { error: 0, warning: 0 };
const byCollection = {};
const byCode = {};
for (const finding of findings) {
  severities[finding.severity] += 1;
  byCollection[finding.collection] ??= { error: 0, warning: 0 };
  byCollection[finding.collection][finding.severity] += 1;
  byCode[finding.code] = (byCode[finding.code] ?? 0) + 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  version: "0.3.0",
  summary: {
    records: records.length,
    collections: Object.keys(COLLECTIONS).length,
    errors: severities.error,
    warnings: severities.warning
  },
  byCollection,
  byCode: Object.fromEntries(Object.entries(byCode).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
  findings
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(JSON_OUTPUT, JSON.stringify(report, null, 2) + "\n", "utf8");

const lines = [
  "# Editorial Quality Report",
  "",
  `Generato: ${report.generatedAt}`,
  "",
  "## Sintesi",
  "",
  `- Contenuti: ${report.summary.records}`,
  `- Collezioni: ${report.summary.collections}`,
  `- Errori bloccanti: ${report.summary.errors}`,
  `- Warning editoriali: ${report.summary.warnings}`,
  "",
  "## Esito per collezione",
  "",
  "| Collezione | Errori | Warning |",
  "|---|---:|---:|"
];
for (const collection of Object.keys(COLLECTIONS)) {
  const item = byCollection[collection] ?? { error: 0, warning: 0 };
  lines.push(`| ${collection} | ${item.error} | ${item.warning} |`);
}
lines.push("", "## Finding", "");
if (!findings.length) {
  lines.push("Nessun finding.");
} else {
  for (const finding of findings) {
    lines.push(`- **${finding.severity.toUpperCase()} · ${finding.code}** — \`${finding.file}\`: ${finding.message}`);
  }
}
lines.push("");
fs.writeFileSync(MARKDOWN_OUTPUT, lines.join("\n"), "utf8");

console.log(`Quality report JSON: ${path.relative(ROOT, JSON_OUTPUT)}`);
console.log(`Quality report Markdown: ${path.relative(ROOT, MARKDOWN_OUTPUT)}`);
console.log(`Esito: ${severities.error} errori bloccanti, ${severities.warning} warning editoriali.`);

if (severities.error > 0) process.exitCode = 1;
