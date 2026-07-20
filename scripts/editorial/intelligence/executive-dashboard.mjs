import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONFIG_FILE = path.join(ROOT, "config", "editorial", "cae-executive-dashboard.json");
const OUTPUT_DIR = path.join(ROOT, "artifacts", "editorial", "dashboard");
const OUTPUT_JSON = path.join(OUTPUT_DIR, "cae-dashboard.json");
const OUTPUT_MD = path.join(OUTPUT_DIR, "CAE_DASHBOARD.md");
const OUTPUT_HTML = path.join(OUTPUT_DIR, "index.html");

function fail(message) {
  console.error(`[CAE executive dashboard] ${message}`);
  process.exit(1);
}

function readJson(file, label, required = true) {
  if (!fs.existsSync(file)) {
    if (required) fail(`${label} non trovato: ${path.relative(ROOT, file)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} non valido: ${error.message}`);
  }
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pct(current, target) {
  if (!target) return 100;
  return clamp(Math.round((current / target) * 100));
}

function priorityOrder(priority) {
  return priority === "high" ? 3 : priority === "medium" ? 2 : 1;
}

const config = readJson(CONFIG_FILE, "Executive Dashboard config");
const sources = Object.fromEntries(
  Object.entries(config.sources).map(([key, rel]) => [
    key,
    readJson(path.join(ROOT, rel), key, key !== "inventory")
  ])
);

const knowledge = sources.knowledge;
const radar = sources.radar;
const missionPlan = sources.missionPlan;
const inventory = sources.inventory;

if (radar.schemaVersion !== "0.3.1") {
  fail(`Schema Opportunity Radar non supportato: ${radar.schemaVersion ?? "assente"}`);
}
if (missionPlan.schemaVersion !== "0.4.0") {
  fail(`Schema Mission Planner non supportato: ${missionPlan.schemaVersion ?? "assente"}`);
}

const coverage = Object.entries(radar.summary?.strategicCoverage ?? {})
  .map(([id, item]) => ({
    id,
    label: config.domainLabels?.[id] ?? id,
    currentAssets: Number(item.currentAssets) || 0,
    targetAssets: Number(item.targetAssets) || 0,
    strategicPriority: item.strategicPriority ?? "medium",
    coveragePercent: pct(item.currentAssets, item.targetAssets),
    gap: Math.max(0, (Number(item.targetAssets) || 0) - (Number(item.currentAssets) || 0))
  }))
  .sort((a, b) =>
    priorityOrder(b.strategicPriority) - priorityOrder(a.strategicPriority) ||
    a.coveragePercent - b.coveragePercent ||
    a.label.localeCompare(b.label)
  );

const missions = [...(missionPlan.missionQueue ?? [])]
  .sort((a, b) => (a.queuePosition ?? 999) - (b.queuePosition ?? 999))
  .map(mission => ({
    missionId: mission.missionId,
    queuePosition: mission.queuePosition,
    title: mission.title,
    missionType: mission.missionType,
    priority: mission.priority,
    score: mission.score,
    status: mission.status,
    estimatedHours: mission.effort?.estimatedHours ?? 0,
    executionAuthorized: mission.governance?.executionAuthorized === true,
    deliverables: (mission.deliverables ?? []).map(item => ({
      product: item.product,
      status: item.status,
      sequence: item.sequence
    }))
  }));

const pipeline = [
  { id: "inventory", label: "Content Inventory", version: "v0.1", ready: Boolean(inventory || knowledge) },
  { id: "knowledge", label: "Knowledge Model", version: "v0.2.1", ready: Boolean(knowledge) },
  { id: "radar", label: "Opportunity Radar", version: "v0.3.1", ready: Boolean(radar) },
  { id: "planner", label: "Mission Planner", version: "v0.4.0", ready: Boolean(missionPlan) },
  { id: "approval", label: "Approval Workflow", version: "v0.5", ready: false }
];

const dashboard = {
  generatedAt: new Date().toISOString(),
  schemaVersion: "0.4.1",
  mode: "read-only-executive-observability",
  product: {
    id: "lab4int-cae",
    name: "Lab4Int — Centro di Analisi Editoriale",
    module: "Executive Dashboard",
    release: "v0.4.1"
  },
  governance: {
    readOnly: true,
    executionAuthorized: false,
    modifiesEditorialContent: false
  },
  kpis: {
    assets: radar.summary?.assetsAnalysed ?? knowledge?.summary?.assets ?? 0,
    collections: Object.keys(radar.summary?.byCollection ?? {}).length,
    assetTypes: Object.keys(radar.summary?.byAssetType ?? {}).length,
    disciplinesDetected: knowledge?.summary?.disciplinesDetected ?? knowledge?.summary?.disciplines ?? null,
    classificationQueue: knowledge?.summary?.classificationQueue ?? 16,
    opportunities: radar.summary?.candidates ?? 0,
    highPriorityOpportunities: radar.summary?.byPriority?.high ?? 0,
    missions: missionPlan.summary?.missionsProposed ?? missions.length,
    estimatedHours: missionPlan.summary?.totalEstimatedHours ?? 0,
    executionAuthorized: missionPlan.summary?.executionAuthorized === true
  },
  coverage,
  missions,
  pipeline,
  sourceState: {
    opportunityRadarGeneratedAt: radar.generatedAt ?? null,
    missionPlanGeneratedAt: missionPlan.generatedAt ?? null
  }
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(dashboard, null, 2)}\n`, "utf8");

const md = [
  "# Lab4Int CAE — Executive Dashboard",
  "",
  `Generato: ${dashboard.generatedAt}`,
  "",
  "## KPI",
  "",
  `- Asset: ${dashboard.kpis.assets}`,
  `- Collezioni: ${dashboard.kpis.collections}`,
  `- Tipi di asset: ${dashboard.kpis.assetTypes}`,
  `- Opportunità: ${dashboard.kpis.opportunities}`,
  `- Opportunità ad alta priorità: ${dashboard.kpis.highPriorityOpportunities}`,
  `- Missioni proposte: ${dashboard.kpis.missions}`,
  `- Impegno stimato: ${dashboard.kpis.estimatedHours} ore`,
  `- Esecuzione autorizzata: ${dashboard.kpis.executionAuthorized ? "sì" : "no"}`,
  "",
  "## Copertura strategica",
  "",
  "| Dominio | Asset | Target | Copertura | Gap | Priorità |",
  "|---|---:|---:|---:|---:|---|",
  ...coverage.map(item =>
    `| ${item.label} | ${item.currentAssets} | ${item.targetAssets} | ${item.coveragePercent}% | ${item.gap} | ${item.strategicPriority} |`
  ),
  "",
  "## Mission Queue",
  "",
  "| # | Missione | Tipo | Priorità | Stato | Ore | Autorizzata |",
  "|---:|---|---|---|---|---:|---|",
  ...missions.map(m =>
    `| ${m.queuePosition} | ${m.title} | ${m.missionType} | ${m.priority} | ${m.status} | ${m.estimatedHours} | ${m.executionAuthorized ? "sì" : "no"} |`
  ),
  "",
  "## Pipeline",
  "",
  ...pipeline.map(item => `- ${item.ready ? "✓" : "○"} ${item.label} ${item.version}`),
  "",
  "## Governance",
  "",
  "La dashboard è in sola lettura. Non modifica contenuti, non approva missioni e non autorizza alcuna esecuzione.",
  ""
].join("\n");

fs.writeFileSync(OUTPUT_MD, `${md}\n`, "utf8");

const coverageHtml = coverage.map(item => `
  <article class="coverage-card">
    <div class="coverage-head">
      <strong>${esc(item.label)}</strong>
      <span class="pill ${esc(item.strategicPriority)}">${esc(item.strategicPriority)}</span>
    </div>
    <div class="metric-line"><span>${item.currentAssets}/${item.targetAssets} asset</span><span>${item.coveragePercent}%</span></div>
    <div class="bar"><span style="width:${item.coveragePercent}%"></span></div>
    <small>${item.gap ? `Gap: ${item.gap}` : "Target raggiunto"}</small>
  </article>`).join("");

const missionHtml = missions.map(mission => `
  <article class="mission-card">
    <div class="mission-top">
      <span class="queue">#${mission.queuePosition}</span>
      <span class="pill ${esc(mission.priority)}">${esc(mission.priority)}</span>
    </div>
    <h3>${esc(mission.title)}</h3>
    <p>${esc(mission.missionType)} · ${mission.estimatedHours} ore · ${esc(mission.status)}</p>
    <div class="deliverables">
      ${mission.deliverables.map(d => `<span>${esc(d.product)}</span>`).join("")}
    </div>
    <small>Esecuzione autorizzata: ${mission.executionAuthorized ? "sì" : "no"}</small>
  </article>`).join("");

const pipelineHtml = pipeline.map(item => `
  <div class="pipeline-step ${item.ready ? "ready" : "pending"}">
    <span class="dot">${item.ready ? "✓" : "○"}</span>
    <div><strong>${esc(item.label)}</strong><small>${esc(item.version)}</small></div>
  </div>`).join("");

const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lab4Int CAE — Executive Dashboard</title>
<style>
:root{color-scheme:dark;--bg:#0a0e14;--panel:#121923;--line:#263241;--text:#edf2f7;--muted:#9aabba;--accent:#d2ad63;--ok:#69c18b;--warn:#d6a85f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
main{max-width:1320px;margin:auto;padding:32px}.eyebrow{color:var(--accent);text-transform:uppercase;letter-spacing:.14em;font-size:12px}
h1{font-size:34px;margin:.25rem 0}h2{font-size:21px;margin:32px 0 14px}h3{font-size:16px;margin:10px 0}
.subtitle,.muted,small{color:var(--muted)}.grid{display:grid;gap:14px}.kpis{grid-template-columns:repeat(6,minmax(0,1fr))}
.card,.coverage-card,.mission-card,.pipeline-step{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px}
.kpi strong{display:block;font-size:28px}.kpi span{color:var(--muted);font-size:13px}.coverage{grid-template-columns:repeat(4,minmax(0,1fr))}
.coverage-head,.metric-line,.mission-top{display:flex;justify-content:space-between;gap:12px;align-items:center}
.metric-line{font-size:13px;color:var(--muted);margin:14px 0 7px}.bar{height:7px;background:#26313d;border-radius:999px;overflow:hidden}.bar span{display:block;height:100%;background:var(--accent)}
.pill{padding:2px 8px;border:1px solid var(--line);border-radius:999px;font-size:11px;text-transform:uppercase}.pill.high{color:#f4cb87}.pill.medium{color:#9dc8ef}
.missions{grid-template-columns:repeat(3,minmax(0,1fr))}.queue{color:var(--accent);font-weight:700}.deliverables{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.deliverables span{border:1px solid var(--line);border-radius:6px;padding:3px 7px;color:var(--muted);font-size:12px}
.pipeline{grid-template-columns:repeat(5,minmax(0,1fr))}.pipeline-step{display:flex;align-items:center;gap:10px}.pipeline-step small{display:block}.dot{font-size:20px}.ready .dot{color:var(--ok)}.pending .dot{color:var(--warn)}
.notice{margin-top:28px;border-left:3px solid var(--accent);padding:12px 16px;background:var(--panel);color:var(--muted)}
footer{margin:32px 0;color:var(--muted);font-size:12px}
@media(max-width:1000px){.kpis{grid-template-columns:repeat(3,1fr)}.coverage{grid-template-columns:repeat(2,1fr)}.missions{grid-template-columns:1fr 1fr}.pipeline{grid-template-columns:1fr 1fr}}
@media(max-width:650px){main{padding:20px}.kpis,.coverage,.missions,.pipeline{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
  <div class="eyebrow">Lab4Int · Centro di Analisi Editoriale</div>
  <h1>Executive Dashboard</h1>
  <p class="subtitle">Vista consolidata, deterministica e in sola lettura degli artefatti CAE.</p>

  <section class="grid kpis">
    <div class="card kpi"><strong>${dashboard.kpis.assets}</strong><span>Asset censiti</span></div>
    <div class="card kpi"><strong>${dashboard.kpis.opportunities}</strong><span>Opportunità</span></div>
    <div class="card kpi"><strong>${dashboard.kpis.highPriorityOpportunities}</strong><span>Priorità alta</span></div>
    <div class="card kpi"><strong>${dashboard.kpis.missions}</strong><span>Missioni proposte</span></div>
    <div class="card kpi"><strong>${dashboard.kpis.estimatedHours}</strong><span>Ore stimate</span></div>
    <div class="card kpi"><strong>No</strong><span>Esecuzione autorizzata</span></div>
  </section>

  <h2>Copertura strategica</h2>
  <section class="grid coverage">${coverageHtml}</section>

  <h2>Mission Queue</h2>
  <section class="grid missions">${missionHtml}</section>

  <h2>Pipeline CAE</h2>
  <section class="grid pipeline">${pipelineHtml}</section>

  <div class="notice"><strong>Governance:</strong> questa dashboard non modifica contenuti, non approva missioni e non autorizza attività.</div>
  <footer>Generato ${esc(dashboard.generatedAt)} · Schema ${esc(dashboard.schemaVersion)} · ${esc(dashboard.mode)}</footer>
</main>
</body>
</html>`;

fs.writeFileSync(OUTPUT_HTML, html, "utf8");

console.log(`[CAE executive dashboard] JSON: ${path.relative(ROOT, OUTPUT_JSON).replaceAll("\\", "/")}`);
console.log(`[CAE executive dashboard] Markdown: ${path.relative(ROOT, OUTPUT_MD).replaceAll("\\", "/")}`);
console.log(`[CAE executive dashboard] HTML: ${path.relative(ROOT, OUTPUT_HTML).replaceAll("\\", "/")}`);
console.log(`[CAE executive dashboard] Asset: ${dashboard.kpis.assets}`);
console.log(`[CAE executive dashboard] Opportunità: ${dashboard.kpis.opportunities}`);
console.log(`[CAE executive dashboard] Missioni: ${dashboard.kpis.missions}`);
console.log("[CAE executive dashboard] Modalità: sola lettura");
