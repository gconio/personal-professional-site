import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const RADAR_FILE = path.join(ROOT, "artifacts", "editorial", "intelligence", "opportunity-radar.json");
const CONFIG_FILE = path.join(ROOT, "config", "editorial", "cae-mission-planner.json");
const OUTPUT_DIR = path.join(ROOT, "artifacts", "editorial", "intelligence");
const OUTPUT_JSON = path.join(OUTPUT_DIR, "mission-plan.json");
const OUTPUT_MD = path.join(OUTPUT_DIR, "MISSION_PLAN.md");

function fail(message) {
  console.error(`[CAE mission planner] ${message}`);
  process.exit(1);
}

function readJson(file, label) {
  if (!fs.existsSync(file)) fail(`${label} non trovato: ${path.relative(ROOT, file)}`);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} non valido: ${error.message}`);
  }
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function stableId(prefix, seed) {
  return `${prefix}-${crypto.createHash("sha256").update(seed).digest("hex").slice(0, 10)}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function priorityRank(priority) {
  return priority === "high" ? 3 : priority === "medium" ? 2 : 1;
}

function highestPriority(items) {
  return items
    .map(item => item.priority)
    .sort((a, b) => priorityRank(b) - priorityRank(a))[0] ?? "low";
}

function maxScore(items) {
  return Math.max(...items.map(item => Number(item.score) || 0));
}

function titleForDomain(domain, label) {
  return `Rafforzare e diversificare il presidio: ${label ?? domain}`;
}

function missionStatus() {
  return "proposed";
}

function estimateEffort(deliverables, config) {
  const weights = config.effortHoursByProduct ?? {};
  const total = deliverables.reduce((sum, item) => sum + (Number(weights[item.product]) || 1), 0);
  return {
    estimatedHours: total,
    size: total >= 16 ? "large" : total >= 8 ? "medium" : "small"
  };
}

function buildDeliverables(products, config) {
  const sequence = arr(config.productSequence);
  const order = new Map(sequence.map((product, index) => [product, index + 1]));
  return unique(products)
    .sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999) || a.localeCompare(b))
    .map((product, index) => ({
      deliverableId: `d${String(index + 1).padStart(2, "0")}`,
      product,
      sequence: index + 1,
      status: "planned",
      approvalRequired: true
    }));
}

const radar = readJson(RADAR_FILE, "Opportunity Radar");
const config = readJson(CONFIG_FILE, "Mission Planner config");

if (radar.schemaVersion !== "0.3.1") {
  fail(`Schema Opportunity Radar non supportato: ${radar.schemaVersion ?? "assente"}. Atteso: 0.3.1`);
}
if (radar.mode !== "deterministic-strategic-coverage") {
  fail(`Modalità Opportunity Radar non supportata: ${radar.mode ?? "assente"}`);
}

const opportunities = arr(radar.opportunities);
if (!opportunities.length) fail("Nessuna opportunità disponibile nel Radar.");

const coverageLabels = new Map(
  arr(config.domainLabels).map(item => [item.id, item.label])
);

const groupedByDomain = new Map();
const repurposing = [];
const classification = [];

for (const opportunity of opportunities) {
  if (
    ["discipline-coverage-gap", "editorial-product-gap"].includes(opportunity.kind) &&
    opportunity.target?.discipline
  ) {
    const domain = opportunity.target.discipline;
    if (!groupedByDomain.has(domain)) groupedByDomain.set(domain, []);
    groupedByDomain.get(domain).push(opportunity);
  } else if (opportunity.kind === "content-repurposing") {
    repurposing.push(opportunity);
  } else if (opportunity.kind === "classification-gap") {
    classification.push(opportunity);
  }
}

const proposed = [];

// Missioni strategiche: unificano gap di copertura e gap di prodotto sullo stesso dominio.
for (const [domain, items] of groupedByDomain.entries()) {
  const score = maxScore(items);
  const priority = highestPriority(items);
  const opportunityIds = items.map(item => item.opportunityId);
  const products = unique(items.flatMap(item => arr(item.recommendedProducts)));
  const deliverables = buildDeliverables(products, config);
  const label = coverageLabels.get(domain) ?? items[0]?.title?.split(": ").at(-1) ?? domain;
  const evidence = {
    sourceOpportunityIds: opportunityIds,
    opportunityKinds: unique(items.map(item => item.kind)),
    sourceScores: items.map(item => item.score),
    coverage: items.find(item => item.kind === "discipline-coverage-gap")?.evidence ?? null,
    productGap: items.find(item => item.kind === "editorial-product-gap")?.evidence ?? null
  };

  proposed.push({
    missionId: stableId("mission", `domain|${domain}|${opportunityIds.slice().sort().join("|")}`),
    missionType: "strategic-domain-development",
    title: titleForDomain(domain, label),
    objective: `Convertire le opportunità relative a ${label} in una sequenza editoriale coordinata e sottoposta ad approvazione.`,
    priority,
    score,
    status: missionStatus(),
    governance: {
      approvalRequired: true,
      executionAuthorized: false,
      humanInTheLoop: true
    },
    target: {
      discipline: domain,
      assetIds: unique(items.flatMap(item => arr(item.target?.assetIds)))
    },
    sourceOpportunityIds: opportunityIds,
    deliverables,
    dependencies: [],
    effort: estimateEffort(deliverables, config),
    evidence
  });
}

// Missioni di valorizzazione: una missione per asset.
for (const opportunity of repurposing) {
  const products = arr(opportunity.recommendedProducts);
  const deliverables = buildDeliverables(products, config);
  proposed.push({
    missionId: stableId("mission", `repurpose|${opportunity.opportunityId}`),
    missionType: "asset-repurposing",
    title: opportunity.title.replace(/^Valorizzare:\s*/u, "Valorizzare l’asset: "),
    objective: "Derivare nuovi prodotti editoriali da un asset esistente, mantenendo coerenza metodologica e tracciabilità della fonte.",
    priority: opportunity.priority,
    score: opportunity.score,
    status: missionStatus(),
    governance: {
      approvalRequired: true,
      executionAuthorized: false,
      humanInTheLoop: true
    },
    target: {
      discipline: opportunity.target?.discipline ?? null,
      assetIds: arr(opportunity.target?.assetIds)
    },
    sourceOpportunityIds: [opportunity.opportunityId],
    deliverables,
    dependencies: [],
    effort: estimateEffort(deliverables, config),
    evidence: {
      sourceOpportunityIds: [opportunity.opportunityId],
      rationale: opportunity.rationale,
      sourceEvidence: opportunity.evidence ?? null
    }
  });
}

// Una sola missione aggregata di manutenzione classificatoria.
if (classification.length) {
  const selected = classification.slice(0, Number(config.classificationMission?.maximumAssets) || 4);
  const deliverables = [{
    deliverableId: "d01",
    product: "classification-review",
    sequence: 1,
    status: "planned",
    approvalRequired: true
  }];
  proposed.push({
    missionId: stableId("mission", `classification|${selected.map(item => item.opportunityId).sort().join("|")}`),
    missionType: "knowledge-maintenance",
    title: "Ridurre la coda di classificazione prioritaria",
    objective: `Classificare ${selected.length} asset prioritari per migliorare qualità e affidabilità del Knowledge Model.`,
    priority: highestPriority(selected),
    score: maxScore(selected),
    status: missionStatus(),
    governance: {
      approvalRequired: true,
      executionAuthorized: false,
      humanInTheLoop: true
    },
    target: {
      discipline: null,
      assetIds: unique(selected.flatMap(item => arr(item.target?.assetIds)))
    },
    sourceOpportunityIds: selected.map(item => item.opportunityId),
    deliverables,
    dependencies: [],
    effort: estimateEffort(deliverables, config),
    evidence: {
      sourceOpportunityIds: selected.map(item => item.opportunityId),
      selectedAssets: selected.map(item => ({
        opportunityId: item.opportunityId,
        title: item.title,
        assetIds: arr(item.target?.assetIds)
      }))
    }
  });
}

const missionTypeQuotas = config.selection?.missionTypeQuotas ?? {};
const maximumMissions = Number(config.selection?.maximumMissions) || 6;

proposed.sort((a, b) =>
  priorityRank(b.priority) - priorityRank(a.priority) ||
  b.score - a.score ||
  a.title.localeCompare(b.title)
);

const selectedMissions = [];
const countByType = {};
for (const mission of proposed) {
  const quota = Number.isFinite(missionTypeQuotas[mission.missionType])
    ? missionTypeQuotas[mission.missionType]
    : maximumMissions;
  const current = countByType[mission.missionType] ?? 0;
  if (current >= quota) continue;
  selectedMissions.push(mission);
  countByType[mission.missionType] = current + 1;
  if (selectedMissions.length >= maximumMissions) break;
}

// La sequenza della queue è deterministica e non equivale ad autorizzazione all'esecuzione.
selectedMissions.forEach((mission, index) => {
  mission.queuePosition = index + 1;
  mission.dependencies = index === 0 ? [] : [selectedMissions[index - 1].missionId];
});

const byPriority = {};
const byType = {};
let totalEstimatedHours = 0;
for (const mission of selectedMissions) {
  byPriority[mission.priority] = (byPriority[mission.priority] ?? 0) + 1;
  byType[mission.missionType] = (byType[mission.missionType] ?? 0) + 1;
  totalEstimatedHours += mission.effort.estimatedHours;
}

const output = {
  generatedAt: new Date().toISOString(),
  schemaVersion: "0.4.0",
  sourceOpportunityRadar: {
    file: path.relative(ROOT, RADAR_FILE).replaceAll("\\", "/"),
    generatedAt: radar.generatedAt ?? null,
    schemaVersion: radar.schemaVersion ?? null,
    mode: radar.mode ?? null
  },
  product: {
    id: "lab4int-cae",
    name: "Lab4Int - Centro di Analisi Editoriale",
    module: "Mission Planner",
    release: "v0.4.0"
  },
  mode: "deterministic-human-approved-planning",
  summary: {
    opportunitiesReceived: opportunities.length,
    missionsProposed: selectedMissions.length,
    byPriority,
    byType,
    totalEstimatedHours,
    executionAuthorized: false
  },
  missionQueue: selectedMissions,
  diagnostics: {
    totalProposedBeforeSelection: proposed.length,
    truncated: proposed.length > selectedMissions.length,
    maximumMissions,
    missionTypeQuotas,
    notes: [
      "Il Mission Planner aggrega opportunità correlate e propone missioni; non autorizza alcuna esecuzione.",
      "Ogni missione e ogni deliverable richiedono approvazione umana.",
      "Le dipendenze indicano un ordine di pianificazione, non l'avvio automatico delle attività.",
      "Gli output generati sono artefatti decisionali e non modificano i contenuti del sito."
    ]
  }
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");

const lines = [
  "# Lab4Int CAE — Mission Plan",
  "",
  `Generato: ${output.generatedAt}`,
  "",
  "## Sintesi",
  "",
  `- Opportunità ricevute: ${output.summary.opportunitiesReceived}`,
  `- Missioni proposte: ${output.summary.missionsProposed}`,
  `- Priorità alta: ${output.summary.byPriority.high ?? 0}`,
  `- Priorità media: ${output.summary.byPriority.medium ?? 0}`,
  `- Impegno totale stimato: ${output.summary.totalEstimatedHours} ore`,
  "- Esecuzione autorizzata: no",
  "",
  "## Mission Queue",
  ""
];

for (const mission of selectedMissions) {
  lines.push(
    `### ${mission.queuePosition}. ${mission.title}`,
    "",
    `- Mission ID: \`${mission.missionId}\``,
    `- Tipo: \`${mission.missionType}\``,
    `- Priorità: \`${mission.priority}\``,
    `- Score: ${mission.score}/100`,
    `- Stato: \`${mission.status}\``,
    `- Obiettivo: ${mission.objective}`,
    `- Impegno stimato: ${mission.effort.estimatedHours} ore (\`${mission.effort.size}\`)`,
    `- Approvazione richiesta: sì`,
    `- Esecuzione autorizzata: no`,
    `- Opportunità sorgente: ${mission.sourceOpportunityIds.map(id => `\`${id}\``).join(", ")}`,
    "",
    "#### Deliverable",
    ""
  );
  for (const deliverable of mission.deliverables) {
    lines.push(`${deliverable.sequence}. \`${deliverable.product}\` — stato: \`${deliverable.status}\``);
  }
  lines.push("");
}

lines.push(
  "## Regola di governance",
  "",
  "Le missioni sono proposte decisionali. Nessuna missione, attività o pubblicazione può essere eseguita senza approvazione umana esplicita.",
  ""
);

fs.writeFileSync(OUTPUT_MD, `${lines.join("\n")}\n`, "utf8");

console.log(`[CAE mission planner] Output JSON: ${path.relative(ROOT, OUTPUT_JSON).replaceAll("\\", "/")}`);
console.log(`[CAE mission planner] Output report: ${path.relative(ROOT, OUTPUT_MD).replaceAll("\\", "/")}`);
console.log(`[CAE mission planner] Opportunità ricevute: ${opportunities.length}`);
console.log(`[CAE mission planner] Missioni proposte: ${selectedMissions.length}`);
console.log(`[CAE mission planner] Impegno stimato: ${totalEstimatedHours} ore`);
console.log("[CAE mission planner] Esecuzione autorizzata: no");
