import fs from "node:fs";
import path from "node:path";
import {
  PATHS, arg, fail, readJson, rel, saveState, selectInboxFolder, slugify,
} from "./common.mjs";
import { readSource, normalizeLines } from "./extract.mjs";
import {
  classifyText, detectDescription, detectTitle, detectTopics,
} from "./classify.mjs";

function findInputFiles(folder) {
  const files = fs.readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(folder, entry.name));

  return {
    source: files.find((file) => [".docx", ".md", ".txt"].includes(path.extname(file).toLowerCase())),
    pdf: files.find((file) => path.extname(file).toLowerCase() === ".pdf"),
    image: files.find((file) => [".png", ".jpg", ".jpeg", ".webp"].includes(path.extname(file).toLowerCase())),
  };
}

const config = readJson(PATHS.config);
const folder = selectInboxFolder();
const inputs = findInputFiles(folder);

if (!inputs.source) fail("Documento sorgente assente: usare .docx, .md oppure .txt.");
if (!inputs.pdf) fail("PDF finale assente: il PDF è obbligatorio.");

const raw = readSource(inputs.source);
const lines = normalizeLines(raw);
if (lines.length === 0) fail("Il documento non contiene testo leggibile.");

const extractedTitle = detectTitle(lines, path.basename(inputs.source));
const title = arg("title", extractedTitle);
const slug = arg("slug", slugify(title));
const description = arg("description", detectDescription(lines, title));
const classification = classifyText(raw, config);
const theme = arg("theme", classification.theme);
const tags = arg("tags")
  ? arg("tags").split(",").map((item) => item.trim()).filter(Boolean)
  : classification.tags;
const visibleFrom = arg("visible-from", new Date().toISOString().slice(0, 10));
const topics = detectTopics(lines, title);
const focus = config.focusByTheme[theme] || config.defaultFocus;

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  fail(`Slug non valido: ${slug}`);
}

const state = {
  version: "1.0",
  stage: "prepared",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slug,
  inboxFolder: rel(folder),
  inputs: {
    source: rel(inputs.source),
    pdf: rel(inputs.pdf),
    image: inputs.image ? rel(inputs.image) : null,
  },
  extracted: {
    title,
    slug,
    description,
    theme,
    tags,
    visibleFrom,
    topics,
    focus,
    classificationConfidence: classification.confidence,
  },
  outputs: {},
  checks: {},
};

saveState(state);

console.log("\n=== PREPARAZIONE AUTOMATICA ===");
console.log(`Titolo        : ${title}`);
console.log(`Slug          : ${slug}`);
console.log(`Descrizione   : ${description}`);
console.log(`Tema          : ${theme}`);
console.log(`Confidenza    : ${Math.round(classification.confidence * 100)}%`);
console.log(`Data          : ${visibleFrom}`);
console.log(`Tag           : ${tags.join(", ")}`);
console.log(`PDF           : ${state.inputs.pdf}`);
console.log(`Thumbnail     : ${state.inputs.image || "ASSENTE"}`);
console.log(`Stato salvato : .editorial/state/${slug}.json`);
console.log("\nPasso successivo:");
console.log(`npm run editorial:verify -- --slug "${slug}"`);
