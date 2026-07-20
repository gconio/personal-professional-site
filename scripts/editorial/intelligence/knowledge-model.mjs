import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const INVENTORY = path.join(ROOT, "artifacts", "editorial", "editorial-index.json");
const TAXONOMY = path.join(ROOT, "config", "editorial", "cae-taxonomy.json");
const REQUIREMENTS = path.join(ROOT, "config", "editorial", "cae-requirements.json");
const OUTPUT_DIR = path.join(ROOT, "artifacts", "editorial", "intelligence");
const OUTPUT = path.join(OUTPUT_DIR, "knowledge-index.json");

function fail(message) {
  console.error(`[CAE knowledge model] ${message}`);
  process.exit(1);
}
function readJson(file, label) {
  if (!fs.existsSync(file)) fail(`${label} non trovato: ${path.relative(ROOT, file)}`);
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { fail(`${label} non valido: ${error.message}`); }
}
function arr(value) { return Array.isArray(value) ? value : []; }
function txt(value) { return typeof value === "string" ? value.trim() : ""; }
function norm(value) {
  return txt(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function stableId(prefix, seed) {
  return `${prefix}-${crypto.createHash("sha256").update(seed).digest("hex").slice(0, 12)}`;
}
function assetType(collection, item) {
  const c = norm(collection);
  const t = norm(item.type);
  if (c === "corsi") return "course";
  if (c === "risorse") return "resource";
  if (c === "media") return "media";
  if (c === "pubblicazioni") {
    if (t.includes("paper")) return "paper";
    if (t.includes("manuale") || t.includes("libro")) return "book";
    if (t.includes("articolo") || t.includes("contributo")) return "article";
    return "publication";
  }
  return "content";
}
function corpus(item) {
  return norm([
    item.title, item.description, item.type, item.category,
    item.searchKey, ...arr(item.tags)
  ].filter(Boolean).join(" "));
}
function matches(corpusText, node) {
  const terms = [node.id, node.label, ...arr(node.aliases)]
    .filter(Boolean).map(norm).filter(Boolean);
  return terms.some(term => corpusText.includes(term));
}
function classify(item, taxonomy) {
  const text = corpus(item);
  const classifications = [];

  for (const domain of arr(taxonomy.domains)) {
    for (const discipline of arr(domain.disciplines)) {
      if (matches(text, discipline)) {
        classifications.push({
          domain: domain.id,
          discipline: discipline.id,
          area: null,
          method: null,
          technique: null,
          concept: null,
          confidence: 1
        });
      }

      for (const area of arr(discipline.areas)) {
        if (matches(text, area)) {
          classifications.push({
            domain: domain.id,
            discipline: discipline.id,
            area: area.id,
            method: null,
            technique: null,
            concept: null,
            confidence: 1
          });
        }

        for (const method of arr(area.methods)) {
          if (matches(text, method)) {
            classifications.push({
              domain: domain.id,
              discipline: discipline.id,
              area: area.id,
              method: method.id,
              technique: null,
              concept: null,
              confidence: 1
            });
          }

          for (const technique of arr(method.techniques)) {
            if (matches(text, technique)) {
              classifications.push({
                domain: domain.id,
                discipline: discipline.id,
                area: area.id,
                method: method.id,
                technique: technique.id,
                concept: null,
                confidence: 1
              });
            }
          }
        }
      }
    }
  }

  const dedup = new Map();
  for (const c of classifications) {
    const key = [
      c.domain, c.discipline, c.area, c.method, c.technique, c.concept
    ].join("|");
    dedup.set(key, c);
  }
  return [...dedup.values()];
}
function editorialProducts(type) {
  const map = {
    article: ["website-article", "linkedin-post", "newsletter-entry"],
    paper: ["website-paper", "linkedin-post", "teaching-update"],
    book: ["book-update", "teaching-update", "linkedin-post"],
    publication: ["website-publication", "linkedin-post"],
    course: ["teaching-material", "course-update"],
    resource: ["resources-entry"],
    media: ["website-media", "linkedin-post"],
    content: ["website-content"]
  };
  return map[type] ?? ["website-content"];
}

const inventory = readJson(INVENTORY, "Editorial inventory");
const taxonomy = readJson(TAXONOMY, "CAE taxonomy");
const requirements = readJson(REQUIREMENTS, "CAE requirements");

if (!inventory.collections || typeof inventory.collections !== "object" || Array.isArray(inventory.collections)) {
  fail("L'inventory non contiene un oggetto collections valido.");
}

const entries = [];
for (const [collection, items] of Object.entries(inventory.collections)) {
  if (!Array.isArray(items)) continue;
  for (const item of items) entries.push({ collection, item });
}
if (!entries.length) fail("L'inventory non contiene elementi nelle collections.");

const assets = entries.map(({ collection, item }) => {
  const type = assetType(collection, item);
  const sourceRef = {
    collection,
    slug: txt(item.slug) || null,
    file: txt(item.file) || null,
    title: txt(item.title) || null
  };
  return {
    assetId: stableId("ka", `${collection}|${sourceRef.file ?? ""}|${sourceRef.slug ?? ""}|${sourceRef.title ?? ""}`),
    sourceRef,
    assetType: type,
    classifications: classify(item, taxonomy),
    editorialProducts: editorialProducts(type),
    relationships: { parents: [], children: [], related: [] },
    knowledgeGaps: [],
    opportunities: [],
    missionLinks: []
  };
});

const byCollection = {}, byType = {}, byDiscipline = {};
for (const asset of assets) {
  const collection = asset.sourceRef.collection;
  byCollection[collection] = (byCollection[collection] ?? 0) + 1;
  byType[asset.assetType] = (byType[asset.assetType] ?? 0) + 1;
  for (const c of asset.classifications) {
    byDiscipline[c.discipline] = (byDiscipline[c.discipline] ?? 0) + 1;
  }
}

const classificationQueue = assets
  .filter(asset => asset.classifications.length === 0)
  .map(asset => ({
    assetId: asset.assetId,
    collection: asset.sourceRef.collection,
    slug: asset.sourceRef.slug,
    title: asset.sourceRef.title,
    reason: "No discipline or subordinate category assigned",
    priority: "normal"
  }));

const output = {
  generatedAt: new Date().toISOString(),
  schemaVersion: "0.2.1",
  sourceInventory: {
    file: path.relative(ROOT, INVENTORY).replaceAll("\\", "/"),
    generatedAt: inventory.generatedAt ?? null,
    schemaVersion: inventory.schemaVersion ?? null
  },
  product: {
    id: "lab4int-cae",
    name: "Lab4Int - Centro di Analisi Editoriale",
    module: "Knowledge Model",
    release: "v0.2.1"
  },
  taxonomyModel: {
    levels: ["domain", "discipline", "area", "method", "technique", "concept"],
    note: "OSINT, HUMINT, SIGINT, GEOINT, IMINT, MASINT, SOCMINT e le altre discipline sono collocate sullo stesso livello tassonomico."
  },
  mission: requirements.mission,
  editorialRequirements: requirements.requirements,
  summary: {
    assets: assets.length,
    byCollection,
    byType,
    byDiscipline,
    classificationQueue: classificationQueue.length
  },
  assets,
  classificationQueue,
  diagnostics: {
    notes: [
      "editorial-index.json resta la fonte autorevole dei metadati editoriali.",
      "knowledge-index.json contiene il livello semantico e relazionale.",
      "OSINT non è gerarchicamente sovraordinata a SOCMINT, GEOINT o IMINT.",
      "Le classificazioni sono deterministiche e basate su alias espliciti."
    ]
  }
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`[CAE knowledge model] Output: ${path.relative(ROOT, OUTPUT).replaceAll("\\", "/")}`);
console.log(`[CAE knowledge model] Asset: ${assets.length}`);
console.log(`[CAE knowledge model] Collections: ${Object.keys(byCollection).length}`);
console.log(`[CAE knowledge model] Tipi: ${Object.keys(byType).length}`);
console.log(`[CAE knowledge model] Discipline rilevate: ${Object.keys(byDiscipline).length}`);
console.log(`[CAE knowledge model] Classification queue: ${classificationQueue.length}`);
