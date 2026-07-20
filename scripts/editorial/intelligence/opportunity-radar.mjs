import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const KNOWLEDGE_INDEX = path.join(ROOT, "artifacts", "editorial", "intelligence", "knowledge-index.json");
const CONFIG = path.join(ROOT, "config", "editorial", "cae-opportunity-radar.json");
const OUTPUT_DIR = path.join(ROOT, "artifacts", "editorial", "intelligence");
const OUTPUT_JSON = path.join(OUTPUT_DIR, "opportunity-radar.json");
const OUTPUT_MD = path.join(OUTPUT_DIR, "OPPORTUNITY_RADAR.md");

function fail(message) {
  console.error(`[CAE opportunity radar] ${message}`);
  process.exit(1);
}
function readJson(file, label) {
  if (!fs.existsSync(file)) fail(`${label} non trovato: ${path.relative(ROOT, file)}`);
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { fail(`${label} non valido: ${error.message}`); }
}
function arr(value) { return Array.isArray(value) ? value : []; }
function stableId(prefix, seed) {
  return `${prefix}-${crypto.createHash("sha256").update(seed).digest("hex").slice(0, 12)}`;
}
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
function priorityFromScore(score, thresholds) {
  if (score >= thresholds.high) return "high";
  if (score >= thresholds.medium) return "medium";
  return "low";
}
function sortObject(obj) {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0])));
}
function strategicBonus(domain, weights) {
  return domain.strategicPriority === "high"
    ? (weights.strategicPriorityHigh ?? 20)
    : domain.strategicPriority === "medium"
      ? (weights.strategicPriorityMedium ?? 10)
      : 0;
}

const knowledge = readJson(KNOWLEDGE_INDEX, "Knowledge index");
const config = readJson(CONFIG, "Opportunity Radar config");
const assets = arr(knowledge.assets);
if (!assets.length) fail("Il Knowledge Model non contiene asset utilizzabili.");

const thresholds = {
  high: config.scoring?.priorityThresholds?.high ?? 75,
  medium: config.scoring?.priorityThresholds?.medium ?? 50
};
const weights = config.scoring?.weights ?? {};
const strategicDomains = arr(config.strategicDomains);
const strategicById = new Map(strategicDomains.map(domain => [domain.id, domain]));

const disciplineAssets = new Map();
const disciplineProducts = new Map();
const typeCounts = {};
const collectionCounts = {};

for (const asset of assets) {
  typeCounts[asset.assetType] = (typeCounts[asset.assetType] ?? 0) + 1;
  const collection = asset.sourceRef?.collection ?? "unknown";
  collectionCounts[collection] = (collectionCounts[collection] ?? 0) + 1;

  const disciplines = new Set(arr(asset.classifications).map(c => c.discipline).filter(Boolean));
  for (const discipline of disciplines) {
    if (!disciplineAssets.has(discipline)) disciplineAssets.set(discipline, []);
    disciplineAssets.get(discipline).push(asset);
    if (!disciplineProducts.has(discipline)) disciplineProducts.set(discipline, new Set());
    for (const product of arr(asset.editorialProducts)) disciplineProducts.get(discipline).add(product);
  }
}

const generated = [];

// 1. Copertura rispetto alla strategia editoriale, non rispetto all'intera tassonomia.
for (const domain of strategicDomains) {
  const count = disciplineAssets.get(domain.id)?.length ?? 0;
  const target = Math.max(0, Number(domain.targetAssets) || 0);
  if (target === 0 || count >= target) continue;

  const gap = target - count;
  const gapRatio = gap / target;
  const score = clamp(
    (weights.coverageBase ?? 45) +
    gapRatio * (weights.coverageGapRatio ?? 30) +
    strategicBonus(domain, weights)
  );

  generated.push({
    opportunityId: stableId("opp", `coverage|${domain.id}|${target}`),
    kind: "discipline-coverage-gap",
    title: `Rafforzare il presidio strategico: ${domain.label}`,
    rationale: `Il dominio strategico dispone di ${count} asset rispetto a un obiettivo editoriale di ${target}.`,
    score,
    priority: priorityFromScore(score, thresholds),
    target: {
      assetIds: arr(disciplineAssets.get(domain.id)).map(asset => asset.assetId),
      discipline: domain.id,
      collection: null
    },
    recommendedProducts: arr(domain.preferredProducts),
    evidence: { currentAssets: count, targetAssets: target, gap, gapRatio: Number(gapRatio.toFixed(3)) },
    status: "candidate"
  });
}

// 2. Diversificazione solo nei domini strategici effettivamente presidiati.
for (const domain of strategicDomains) {
  const assetsForDomain = disciplineAssets.get(domain.id) ?? [];
  if (!assetsForDomain.length) continue;

  const actual = disciplineProducts.get(domain.id) ?? new Set();
  const expected = arr(domain.preferredProducts);
  const missing = expected.filter(product => !actual.has(product));
  if (!missing.length) continue;

  const score = clamp(
    (weights.productDiversification ?? 42) +
    missing.length * (weights.missingProduct ?? 7) +
    strategicBonus(domain, weights) +
    (assetsForDomain.length >= Math.max(4, Math.ceil((domain.targetAssets ?? 0) / 2))
      ? (weights.matureDomainBonus ?? 8)
      : 0)
  );

  generated.push({
    opportunityId: stableId("opp", `products|${domain.id}|${missing.slice().sort().join(",")}`),
    kind: "editorial-product-gap",
    title: `Diversificare i prodotti: ${domain.label}`,
    rationale: "Il dominio è strategico e già presente nel patrimonio, ma non copre tutti i prodotti editoriali attesi.",
    score,
    priority: priorityFromScore(score, thresholds),
    target: {
      assetIds: assetsForDomain.map(asset => asset.assetId),
      discipline: domain.id,
      collection: null
    },
    recommendedProducts: missing,
    evidence: { existingProducts: [...actual].sort(), missingProducts: missing },
    status: "candidate"
  });
}

// 3. Repurposing, con bonus per gli asset appartenenti ai domini strategici.
for (const asset of assets) {
  if (!["paper", "book", "course"].includes(asset.assetType)) continue;
  const products = new Set(arr(asset.editorialProducts));
  const recommendations = arr(config.rules?.repurposingByAssetType?.[asset.assetType])
    .filter(product => !products.has(product));
  if (!recommendations.length) continue;

  const disciplines = arr(asset.classifications).map(item => item.discipline).filter(Boolean);
  const strategicDiscipline = disciplines.find(id => strategicById.has(id)) ?? null;
  const typeBonus = asset.assetType === "paper"
    ? (weights.paperBonus ?? 12)
    : asset.assetType === "book"
      ? (weights.bookBonus ?? 15)
      : (weights.courseBonus ?? 5);
  const score = clamp(
    (weights.repurposing ?? 48) +
    typeBonus +
    (strategicDiscipline ? (weights.strategicDomainBonus ?? 8) : 0) +
    Math.min(9, arr(asset.classifications).length * 3)
  );

  generated.push({
    opportunityId: stableId("opp", `repurpose|${asset.assetId}|${recommendations.slice().sort().join(",")}`),
    kind: "content-repurposing",
    title: `Valorizzare: ${asset.sourceRef?.title ?? asset.sourceRef?.slug ?? asset.assetId}`,
    rationale: "L'asset può alimentare ulteriori prodotti editoriali senza richiedere la creazione di una nuova base conoscitiva.",
    score,
    priority: priorityFromScore(score, thresholds),
    target: {
      assetIds: [asset.assetId],
      discipline: strategicDiscipline ?? disciplines[0] ?? null,
      collection: asset.sourceRef?.collection ?? null
    },
    recommendedProducts: recommendations,
    evidence: { assetType: asset.assetType, currentProducts: [...products], strategicDiscipline },
    status: "candidate"
  });
}

// 4. Classificazione: necessaria, ma non deve saturare il radar strategico.
for (const item of arr(knowledge.classificationQueue)) {
  const score = clamp(
    (weights.classificationGap ?? 60) +
    (item.collection === "pubblicazioni" ? (weights.classificationPublicationBonus ?? 8) : 0)
  );
  generated.push({
    opportunityId: stableId("opp", `classification|${item.assetId}`),
    kind: "classification-gap",
    title: `Classificare: ${item.title ?? item.slug ?? item.assetId}`,
    rationale: "L'asset non è ancora associato a una disciplina o a una categoria subordinata.",
    score,
    priority: priorityFromScore(score, thresholds),
    target: { assetIds: [item.assetId], discipline: null, collection: item.collection ?? null },
    recommendedProducts: [],
    evidence: { source: "knowledge-index.classificationQueue", reason: item.reason ?? null },
    status: "candidate"
  });
}

generated.sort((a, b) => b.score - a.score || a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));

const quotas = config.rules?.candidateQuotas ?? {};
const maximumCandidates = config.rules?.maximumCandidates ?? 15;
const selected = [];
const selectedCountByKind = {};
for (const item of generated) {
  const quota = Number.isFinite(quotas[item.kind]) ? quotas[item.kind] : maximumCandidates;
  const current = selectedCountByKind[item.kind] ?? 0;
  if (current >= quota) continue;
  selected.push(item);
  selectedCountByKind[item.kind] = current + 1;
  if (selected.length >= maximumCandidates) break;
}
selected.sort((a, b) => b.score - a.score || a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));

const byKind = {};
const byPriority = {};
for (const item of selected) {
  byKind[item.kind] = (byKind[item.kind] ?? 0) + 1;
  byPriority[item.priority] = (byPriority[item.priority] ?? 0) + 1;
}

const strategicCoverage = {};
for (const domain of strategicDomains) {
  strategicCoverage[domain.id] = {
    currentAssets: disciplineAssets.get(domain.id)?.length ?? 0,
    targetAssets: domain.targetAssets ?? 0,
    strategicPriority: domain.strategicPriority ?? "medium"
  };
}

const output = {
  generatedAt: new Date().toISOString(),
  schemaVersion: "0.3.1",
  sourceKnowledgeModel: {
    file: path.relative(ROOT, KNOWLEDGE_INDEX).replaceAll("\\", "/"),
    generatedAt: knowledge.generatedAt ?? null,
    schemaVersion: knowledge.schemaVersion ?? null
  },
  product: {
    id: "lab4int-cae",
    name: "Lab4Int - Centro di Analisi Editoriale",
    module: "Opportunity Radar",
    release: "v0.3.1"
  },
  mode: "deterministic-strategic-coverage",
  summary: {
    assetsAnalysed: assets.length,
    candidates: selected.length,
    byPriority: sortObject(byPriority),
    byKind: sortObject(byKind),
    strategicCoverage: sortObject(strategicCoverage),
    taxonomyOnlyDomains: arr(config.taxonomyOnlyDomains).slice().sort(),
    byAssetType: sortObject(typeCounts),
    byCollection: sortObject(collectionCounts)
  },
  opportunities: selected,
  diagnostics: {
    truncated: generated.length > selected.length,
    totalGeneratedBeforeSelection: generated.length,
    candidateQuotas: quotas,
    notes: [
      "La copertura è valutata rispetto ai domini strategici Lab4Int, non rispetto all'intera tassonomia intelligence.",
      "I domini taxonomy-only non generano automaticamente gap di copertura.",
      "Le quote impediscono che una sola famiglia di opportunità saturi il radar.",
      "Le opportunità sono candidati decisionali, non attività approvate."
    ]
  }
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");

const lines = [
  "# Lab4Int CAE — Opportunity Radar",
  "",
  `Generato: ${output.generatedAt}`,
  "",
  "## Sintesi",
  "",
  `- Asset analizzati: ${output.summary.assetsAnalysed}`,
  `- Opportunità candidate: ${output.summary.candidates}`,
  `- Priorità alta: ${output.summary.byPriority.high ?? 0}`,
  `- Priorità media: ${output.summary.byPriority.medium ?? 0}`,
  `- Priorità bassa: ${output.summary.byPriority.low ?? 0}`,
  "",
  "## Copertura strategica",
  ""
];
for (const domain of strategicDomains) {
  const coverage = strategicCoverage[domain.id];
  lines.push(`- ${domain.label}: ${coverage.currentAssets}/${coverage.targetAssets} asset`);
}
lines.push("", "## Opportunità prioritarie", "");
for (const item of selected) {
  lines.push(
    `### ${item.score}/100 — ${item.title}`,
    "",
    `- Tipo: \`${item.kind}\``,
    `- Priorità: \`${item.priority}\``,
    `- Motivazione: ${item.rationale}`,
    `- Prodotti suggeriti: ${item.recommendedProducts.length ? item.recommendedProducts.map(product => `\`${product}\``).join(", ") : "nessuno"}`,
    ""
  );
}
fs.writeFileSync(OUTPUT_MD, `${lines.join("\n")}\n`, "utf8");

console.log(`[CAE opportunity radar] Output JSON: ${path.relative(ROOT, OUTPUT_JSON).replaceAll("\\", "/")}`);
console.log(`[CAE opportunity radar] Output report: ${path.relative(ROOT, OUTPUT_MD).replaceAll("\\", "/")}`);
console.log(`[CAE opportunity radar] Asset analizzati: ${assets.length}`);
console.log(`[CAE opportunity radar] Opportunità candidate: ${selected.length}`);
console.log(`[CAE opportunity radar] Priorità alta: ${byPriority.high ?? 0}`);
console.log(`[CAE opportunity radar] Priorità media: ${byPriority.medium ?? 0}`);
console.log(`[CAE opportunity radar] Priorità bassa: ${byPriority.low ?? 0}`);
