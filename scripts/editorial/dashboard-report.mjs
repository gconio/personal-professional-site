import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";

const BUILD_TARGET = process.argv.includes("--console") ? "console" : "standalone";
const IS_CONSOLE = BUILD_TARGET === "console";

const OUTPUT_DIR = path.join(ROOT, "artifacts", "editorial");
const DASHBOARD_DIR = path.join(OUTPUT_DIR, "dashboard");
const HTML_OUTPUT = path.join(DASHBOARD_DIR, "index.html");
const DATA_OUTPUT = path.join(DASHBOARD_DIR, "dashboard-data.json");

const sources = {
  inventory: path.join(OUTPUT_DIR, "editorial-index.json"),
  quality: path.join(OUTPUT_DIR, "editorial-quality-report.json"),
  governance: path.join(OUTPUT_DIR, "editorial-governance-report.json")
};

function readJson(name, file) {
  if (!fs.existsSync(file)) {
    console.error(`Report richiesto non trovato (${name}): ${path.relative(ROOT, file)}`);
    console.error("Eseguire prima editorial:inventory, editorial:quality ed editorial:governance.");
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`JSON non valido (${name}): ${error.message}`);
    process.exit(1);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function ratio(part, whole, emptyValue = 1) {
  if (!whole) return emptyValue;
  return clamp01(part / whole);
}

function healthBand(index) {
  if (index >= 85) return { id: "high", label: "Salute elevata", action: "Mantenimento ordinario" };
  if (index >= 70) return { id: "good", label: "Salute buona", action: "Revisione pianificata" };
  if (index >= 50) return { id: "fragile", label: "Salute fragile", action: "Intervento prioritario" };
  return { id: "critical", label: "Rischio significativo", action: "Piano correttivo immediato" };
}

function calculateHealth({ total, current, reviewDue, stale, undated, warnings, errors }) {
  if (total === 0) {
    return {
      index: 100,
      band: healthBand(100),
      components: {
        currentRatio: 1,
        freshnessScore: 1,
        metadataScore: 1,
        qualityScore: 1
      },
      weights: {
        currentRatio: 0.40,
        freshnessScore: 0.25,
        metadataScore: 0.20,
        qualityScore: 0.15
      }
    };
  }

  const currentRatio = ratio(current, total, 0);
  const freshnessPenalty = ((reviewDue * 0.5) + stale) / total;
  const freshnessScore = clamp01(1 - freshnessPenalty);
  const metadataScore = clamp01(1 - ratio(undated, total, 0));
  const qualityPenalty = ((warnings * 0.5) + (errors * 2)) / total;
  const qualityScore = clamp01(1 - qualityPenalty);

  const raw =
    (40 * currentRatio) +
    (25 * freshnessScore) +
    (20 * metadataScore) +
    (15 * qualityScore);

  const index = Math.round(Math.max(0, Math.min(100, raw)));

  return {
    index,
    band: healthBand(index),
    components: {
      currentRatio,
      freshnessScore,
      metadataScore,
      qualityScore
    },
    weights: {
      currentRatio: 0.40,
      freshnessScore: 0.25,
      metadataScore: 0.20,
      qualityScore: 0.15
    }
  };
}

const inventory = readJson("inventory", sources.inventory);
const quality = readJson("quality", sources.quality);
const governance = readJson("governance", sources.governance);

const status = governance.summary?.statuses ?? {};
const priorities = governance.summary?.priorities ?? {};
const qualitySummary = quality.summary ?? {};
const collectionRows = Object.entries(governance.byCollection ?? {})
  .map(([name, item]) => ({ name, ...item }));
const total = governance.summary?.records ?? 0;
const actionQueue = governance.actionQueue ?? [];
const revisionQueue = actionQueue.filter((item) =>
  item.status === "stale" || item.status === "review-due"
);
const metadataQueue = actionQueue.filter((item) => item.status === "undated");
const qualityCodes = Object.entries(quality.byCode ?? {});

const health = calculateHealth({
  total,
  current: status.current ?? 0,
  reviewDue: status["review-due"] ?? 0,
  stale: status.stale ?? 0,
  undated: status.undated ?? 0,
  warnings: qualitySummary.warnings ?? 0,
  errors: qualitySummary.errors ?? 0
});

const data = {
  generatedAt: new Date().toISOString(),
  version: "0.1.0",
  product: {
    id: "lab4int-cae",
    name: "Lab4Int — Centro di Analisi Editoriale",
    release: "v0.1a",
    buildTarget: BUILD_TARGET
  },
  sourceGeneratedAt: {
    inventory: inventory.generatedAt,
    quality: quality.generatedAt,
    governance: governance.generatedAt
  },
  health,
  inventory,
  quality,
  governance
};

const collectionTable = collectionRows.map((row) => `
  <tr>
    <th scope="row">${escapeHtml(row.name)}</th>
    <td>${row.total ?? 0}</td>
    <td>${row.statuses?.current ?? 0}</td>
    <td>${row.statuses?.["review-due"] ?? 0}</td>
    <td>${row.statuses?.stale ?? 0}</td>
    <td>${row.statuses?.undated ?? 0}</td>
    <td>${row.priorities?.P1 ?? 0}</td>
    <td>${row.priorities?.P2 ?? 0}</td>
    <td>${row.priorities?.P3 ?? 0}</td>
  </tr>`).join("");

const queueRows = actionQueue.map((item, index) => {
  const queueType = item.status === "undated" ? "metadata" : "revision";
  const sourceHref = `../../../${String(item.file ?? "").replaceAll("\\", "/")}`;
  const searchable = `${item.title} ${item.file} ${item.collection} ${item.reason ?? ""}`.toLowerCase();
  return `
  <tr data-priority="${escapeHtml(item.priority)}"
      data-status="${escapeHtml(item.status)}"
      data-queue="${queueType}"
      data-search="${escapeHtml(searchable)}">
    <td>${index + 1}</td>
    <td><span class="badge priority-${escapeHtml(String(item.priority ?? "").toLowerCase())}">${escapeHtml(item.priority)}</span></td>
    <td><span class="badge status-${escapeHtml(item.status)}">${escapeHtml(item.status)}</span></td>
    <td><strong>${escapeHtml(item.title || item.slug)}</strong><small><a href="${escapeHtml(sourceHref)}">${escapeHtml(item.file)}</a></small></td>
    <td>${escapeHtml(item.collection)}</td>
    <td>${escapeHtml(item.referenceDate ?? "—")}</td>
    <td>${item.ageDays ?? "—"}</td>
    <td>${escapeHtml(item.reason ?? "—")}</td>
  </tr>`;
}).join("");

const qualityRows = qualityCodes
  .map(([code, count]) => `<tr><th scope="row">${escapeHtml(code)}</th><td>${count}</td></tr>`)
  .join("");

const coverageRows = Object.entries(governance.coverage?.categories ?? {})
  .map(([name, count]) => `<tr><th scope="row">${escapeHtml(name)}</th><td>${count}</td></tr>`)
  .join("");

const statusSegments = [
  ["current", status.current ?? 0],
  ["review-due", status["review-due"] ?? 0],
  ["stale", status.stale ?? 0],
  ["undated", status.undated ?? 0]
].map(([name, count]) =>
  `<span class="segment ${name}" style="width:${total ? (count / total) * 100 : 0}%" title="${name}: ${count}"></span>`
).join("");

const componentRows = [
  ["Current ratio", health.components.currentRatio, 40],
  ["Freshness score", health.components.freshnessScore, 25],
  ["Metadata score", health.components.metadataScore, 20],
  ["Quality score", health.components.qualityScore, 15]
].map(([label, value, weight]) => `
  <tr>
    <th scope="row">${label}</th>
    <td>${Math.round(value * 100)}%</td>
    <td>${weight}%</td>
  </tr>`).join("");

const consoleCss = IS_CONSOLE ? `
.console-topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:12px 24px;background:rgba(10,17,29,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}
.console-brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none}
.console-brand img{width:34px;height:34px;object-fit:contain;border-radius:10px;background:rgba(255,255,255,.08);padding:3px}
.console-brand span{display:grid;line-height:1.15}
.console-brand strong{font-size:1rem}
.console-brand small{color:var(--muted);font-size:.76rem}
.console-nav{display:flex;gap:.55rem;flex-wrap:wrap;align-items:center;justify-content:flex-end;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.10);border-radius:999px;padding:.34rem .46rem}
.console-nav a{color:#f5f7fb;text-decoration:none;font-size:.95rem;font-weight:700;line-height:1;padding:.46rem .72rem;border-radius:999px;border:1px solid rgba(255,255,255,.08)}
.console-nav a.active,.console-nav a[aria-current="page"]{background:rgba(212,175,55,.14);border-color:rgba(212,175,55,.34);color:#f3d06b}
.console-context{width:min(1440px,calc(100% - 32px));margin:16px auto 0;display:flex;justify-content:space-between;align-items:center;gap:16px}
.console-breadcrumb{color:var(--muted);font-size:.86rem}
.console-breadcrumb a{color:var(--muted);text-decoration:none}
.console-back{display:inline-flex;align-items:center;color:#f5f7fb;text-decoration:none;font-size:.88rem;font-weight:700;padding:.46rem .72rem;border-radius:999px;border:1px solid rgba(255,255,255,.10)}
@media(max-width:680px){.console-topbar{align-items:flex-start;flex-direction:column;padding:12px 14px}.console-nav{width:100%;justify-content:flex-start;border-radius:18px}.console-context{width:min(100% - 20px,1440px);align-items:flex-start;flex-direction:column}}
` : "";

const consoleChrome = IS_CONSOLE ? `
<header class="console-topbar">
  <a class="console-brand" href="../../index.html">
    <img src="../../logo-Lab4Int.png" alt="Lab4Int logo">
    <span><strong>Lab4Int</strong><small>Agent Console</small></span>
  </a>
  <nav class="console-nav" aria-label="Primary navigation">
    <a href="../../index.html">Dashboard</a>
    <a href="../../operations.html">Operations</a>
    <a href="../../status.html">Status</a>
    <a href="../../policy.html">Policy</a>
    <a class="active" aria-current="page" href="./index.html">CAE</a>
  </nav>
</header>
<section class="console-context" aria-label="Contesto di navigazione">
  <nav class="console-breadcrumb" aria-label="Breadcrumb">
    <a href="../../index.html">Agent Console</a>
    <span aria-hidden="true"> / </span>
    <strong>Centro di Analisi Editoriale</strong>
  </nav>
  <a class="console-back" href="../../index.html">&larr; Agent Console</a>
</section>
` : "";

const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Lab4Int — Centro di Analisi Editoriale</title>
<style>
:root{--bg:#0b1220;--panel:#121c2e;--panel2:#18243a;--text:#eef4ff;--muted:#a7b4c8;--line:#2b3a54;--accent:#75a7ff;--ok:#50c878;--warn:#f0bd4f;--bad:#f27878;--neutral:#8fa1b8;--shadow:0 14px 36px rgba(0,0,0,.22)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:linear-gradient(160deg,#08101d 0%,var(--bg) 50%,#10192a 100%);color:var(--text);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)}.shell{width:min(1440px,calc(100% - 32px));margin:auto;padding:30px 0 60px}.masthead{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:24px}.eyebrow{text-transform:uppercase;letter-spacing:.13em;color:var(--accent);font-weight:750;font-size:.76rem}.masthead h1{font-size:clamp(2rem,4vw,3.5rem);line-height:1.04;margin:.25rem 0}.masthead p{color:var(--muted);margin:0;max-width:820px}.meta{text-align:right;color:var(--muted);font-size:.86rem}.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}.card{background:rgba(18,28,46,.9);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);padding:20px}.health{grid-column:span 4;min-height:220px}.health-score{font-size:4rem;line-height:1;font-weight:800;margin:.35rem 0}.health-band{display:inline-block;border:1px solid currentColor;border-radius:999px;padding:4px 10px;font-weight:700}.band-high,.band-good{color:var(--ok)}.band-fragile{color:var(--warn)}.band-critical{color:var(--bad)}.kpi{grid-column:span 2;min-height:132px}.kpi strong{display:block;font-size:2.05rem;line-height:1.1;margin-top:13px}.kpi span{color:var(--muted)}.wide{grid-column:span 8}.side{grid-column:span 4}.full{grid-column:1/-1}h2{margin:0 0 14px;font-size:1.15rem}.statusbar{height:18px;border-radius:999px;overflow:hidden;display:flex;background:#26344c;margin:18px 0}.segment{height:100%}.current{background:var(--ok)}.review-due{background:var(--warn)}.stale{background:var(--bad)}.undated{background:var(--neutral)}.legend{display:flex;gap:16px;flex-wrap:wrap;color:var(--muted)}.dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px}table{border-collapse:collapse;width:100%;min-width:700px}th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line)}thead th{position:sticky;top:0;background:var(--panel2);z-index:1;font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}tbody tr:last-child>*{border-bottom:0}tbody tr:hover{background:rgba(117,167,255,.06)}td small{display:block;color:var(--muted);margin-top:2px}.badge{display:inline-block;border:1px solid currentColor;border-radius:999px;padding:2px 8px;font-size:.76rem;font-weight:700}.priority-p1,.status-stale{color:var(--bad)}.priority-p2,.status-review-due{color:var(--warn)}.priority-p3,.status-current{color:var(--ok)}.status-undated{color:var(--neutral)}.controls{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}.controls input,.controls select,.controls button{background:#0e1727;color:var(--text);border:1px solid var(--line);border-radius:9px;padding:9px 11px;font:inherit}.controls button{cursor:pointer}.controls input{flex:1;min-width:220px}.empty{display:none;color:var(--muted);padding:18px}.note{color:var(--muted);font-size:.9rem}.mini{min-width:0}.mini table{min-width:0}.footer{color:var(--muted);margin-top:22px;font-size:.82rem;text-align:center}@media(max-width:1050px){.health,.wide,.side{grid-column:1/-1}.kpi{grid-column:span 4}}@media(max-width:680px){.shell{width:min(100% - 20px,1440px);padding-top:18px}.masthead{align-items:flex-start;flex-direction:column}.meta{text-align:left}.kpi{grid-column:span 6}.card{padding:15px}}@media print{body{background:#fff;color:#111}.card{box-shadow:none;background:#fff;border-color:#bbb}.controls{display:none}.shell{width:100%}.meta,.note,.legend{color:#444}}
${consoleCss}
</style>
</head>
<body>
${consoleChrome}
<main class="shell">
<header class="masthead">
  <div>
    <div class="eyebrow">Lab4Int · Centro di Analisi Editoriale · v0.1a · ${escapeHtml(BUILD_TARGET)}</div>
    <h1>Centro di Analisi Editoriale</h1>
    <p>Supporto decisionale per la gestione e la produzione di articoli, paper e suggerimenti destinati alla sezione Risorse del sito personale.</p>
  </div>
  <div class="meta">Generato: ${escapeHtml(data.generatedAt)}<br>Governance: ${escapeHtml(governance.asOfDate ?? "—")}<br>Schema: v${escapeHtml(data.version)}</div>
</header>

<section class="grid" aria-label="Executive Brief">
  <div class="card health">
    <span class="eyebrow">Content Health Index</span>
    <div class="health-score">${health.index}</div>
    <span class="health-band band-${escapeHtml(health.band.id)}">${escapeHtml(health.band.label)}</span>
    <p class="note">${escapeHtml(health.band.action)}. Indice trasparente, deterministico e calcolato esclusivamente dai report locali.</p>
  </div>

  <div class="card wide">
    <h2>Composizione dell'indice</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Componente</th><th>Punteggio</th><th>Peso</th></tr></thead>
      <tbody>${componentRows}</tbody>
    </table></div>
    <p class="note">Formula: 40% current ratio + 25% freshness + 20% completezza metadati + 15% qualità.</p>
  </div>

  <div class="card kpi"><span>Contenuti</span><strong>${total}</strong><span>${governance.summary?.collections ?? 0} collezioni</span></div>
  <div class="card kpi"><span>Current</span><strong>${status.current ?? 0}</strong><span>${total ? Math.round((status.current ?? 0)/total*100) : 0}% del totale</span></div>
  <div class="card kpi"><span>Da revisionare</span><strong>${revisionQueue.length}</strong><span>stale o review-due</span></div>
  <div class="card kpi"><span>Metadati</span><strong>${metadataQueue.length}</strong><span>contenuti senza data</span></div>
  <div class="card kpi"><span>Warning</span><strong>${qualitySummary.warnings ?? 0}</strong><span>quality findings</span></div>
  <div class="card kpi"><span>Errori</span><strong>${qualitySummary.errors ?? 0}</strong><span>bloccanti</span></div>

  <div class="card wide">
    <h2>Stato del patrimonio editoriale</h2>
    <div class="statusbar" role="img" aria-label="Distribuzione dello stato editoriale">${statusSegments}</div>
    <div class="legend">
      <span><i class="dot current"></i>Current ${status.current ?? 0}</span>
      <span><i class="dot review-due"></i>Review due ${status["review-due"] ?? 0}</span>
      <span><i class="dot stale"></i>Stale ${status.stale ?? 0}</span>
      <span><i class="dot undated"></i>Undated ${status.undated ?? 0}</span>
    </div>
  </div>

  <div class="card side">
    <h2>Priorità operative</h2>
    <p><strong>P1: ${priorities.P1 ?? 0}</strong> · intervento prioritario</p>
    <p><strong>P2: ${priorities.P2 ?? 0}</strong> · revisione pianificabile</p>
    <p><strong>P3: ${priorities.P3 ?? 0}</strong> · nessuna azione</p>
    <p class="note">In v0.1a questa sezione conserva la governance esistente. L'Opportunity Radar sarà introdotto nel ciclo successivo.</p>
  </div>

  <div class="card full">
    <h2>Stato per collezione</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Collezione</th><th>Totale</th><th>Current</th><th>Review due</th><th>Stale</th><th>Undated</th><th>P1</th><th>P2</th><th>P3</th></tr></thead>
      <tbody>${collectionTable}</tbody>
    </table></div>
  </div>

  <div class="card full">
    <h2>Coda operativa</h2>
    <p class="note">La coda esistente viene mantenuta come base dell'Action Center. In questa fase non vengono modificati automaticamente i contenuti sorgente.</p>
    <div class="controls">
      <input id="search" type="search" placeholder="Cerca titolo, file, collezione o motivazione" aria-label="Cerca nella coda operativa">
      <select id="queue-type" aria-label="Filtra per tipo di intervento">
        <option value="revision">Revisioni sostanziali</option>
        <option value="metadata">Completamento metadati</option>
        <option value="">Tutta la coda</option>
      </select>
      <select id="priority" aria-label="Filtra per priorità">
        <option value="">Tutte le priorità</option><option>P1</option><option>P2</option>
      </select>
      <select id="status" aria-label="Filtra per stato">
        <option value="">Tutti gli stati</option>
        <option value="stale">stale</option>
        <option value="review-due">review-due</option>
        <option value="undated">undated</option>
      </select>
      <button id="export" type="button">Esporta CSV filtrato</button>
      <button id="print" type="button">Stampa</button>
    </div>
    <p class="note"><strong id="visible-count">0</strong> elementi visualizzati.</p>
    <div class="table-wrap"><table id="queue">
      <thead><tr><th>#</th><th>Priorità</th><th>Stato</th><th>Contenuto</th><th>Collezione</th><th>Riferimento</th><th>Età (gg)</th><th>Motivazione</th></tr></thead>
      <tbody>${queueRows}</tbody>
    </table><div id="empty" class="empty">Nessun contenuto corrisponde ai filtri.</div></div>
  </div>

  <div class="card side mini"><h2>Quality findings per codice</h2><div class="table-wrap"><table><thead><tr><th>Codice</th><th>Totale</th></tr></thead><tbody>${qualityRows || '<tr><td colspan="2">Nessun finding</td></tr>'}</tbody></table></div></div>
  <div class="card side mini"><h2>Copertura per categoria</h2><div class="table-wrap"><table><thead><tr><th>Categoria</th><th>Totale</th></tr></thead><tbody>${coverageRows || '<tr><td colspan="2">Nessuna categoria</td></tr>'}</tbody></table></div></div>
  <div class="card side"><h2>Provenienza dati</h2><p class="note">Inventory: ${escapeHtml(inventory.generatedAt ?? "—")}</p><p class="note">Quality: ${escapeHtml(quality.generatedAt ?? "—")}</p><p class="note">Governance: ${escapeHtml(governance.generatedAt ?? "—")}</p><p class="note">File dati: <code>dashboard-data.json</code></p></div>
</section>

<p class="footer">Lab4Int — Centro di Analisi Editoriale v0.1a · target ${escapeHtml(BUILD_TARGET)} · artefatto generato automaticamente</p>
</main>

<script id="dashboard-data" type="application/json">${safeJson(data)}</script>
<script>
const rows=[...document.querySelectorAll('#queue tbody tr')];
const search=document.querySelector('#search');
const queueType=document.querySelector('#queue-type');
const priority=document.querySelector('#priority');
const statusFilter=document.querySelector('#status');
const empty=document.querySelector('#empty');
const visibleCount=document.querySelector('#visible-count');
function visibleRows(){return rows.filter((row)=>!row.hidden)}
function filter(){
  const q=search.value.trim().toLowerCase();
  let visible=0;
  for(const row of rows){
    const ok=(!q||row.dataset.search.includes(q))
      &&(!queueType.value||row.dataset.queue===queueType.value)
      &&(!priority.value||row.dataset.priority===priority.value)
      &&(!statusFilter.value||row.dataset.status===statusFilter.value);
    row.hidden=!ok;
    if(ok)visible++;
  }
  empty.style.display=visible?'none':'block';
  visibleCount.textContent=String(visible);
}
function csvCell(value){
  const text=String(value??'').replace(/\s+/g,' ').trim();
  return '"'+text.replaceAll('"','""')+'"';
}
function exportCsv(){
  const header=[...document.querySelectorAll('#queue thead th')].map((cell)=>csvCell(cell.textContent));
  const body=visibleRows().map((row)=>[...row.cells].map((cell)=>csvCell(cell.textContent)));
  const csv=[header,...body].map((line)=>line.join(';')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download='lab4int-cae-action-queue.csv';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),0);
}
for(const control of [search,queueType,priority,statusFilter])control.addEventListener('input',filter);
document.querySelector('#export').addEventListener('click',exportCsv);
document.querySelector('#print').addEventListener('click',()=>window.print());
filter();
</script>
</body>
</html>`;

fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
fs.writeFileSync(DATA_OUTPUT, JSON.stringify(data, null, 2) + "\n", "utf8");
fs.writeFileSync(HTML_OUTPUT, html, "utf8");

console.log(`CAE HTML: ${path.relative(ROOT, HTML_OUTPUT)}`);
console.log(`CAE data: ${path.relative(ROOT, DATA_OUTPUT)}`);
console.log(`Build target: ${BUILD_TARGET}`);
console.log(`Content Health Index: ${health.index}/100 (${health.band.label})`);
console.log(`Esito: ${total} contenuti, ${revisionQueue.length} revisioni, ${metadataQueue.length} interventi metadati, ${qualitySummary.warnings ?? 0} warning.`);
