import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { ROOT } from "../lib.mjs";

export const PATHS = {
  root: ROOT,
  inbox: path.join(ROOT, "incoming", "pubblicazioni"),
  config: path.join(ROOT, ".editorial", "publishing.json"),
  state: path.join(ROOT, ".editorial", "state"),
  content: path.join(ROOT, "src", "content", "pubblicazioni"),
  pdf: path.join(ROOT, "public", "documenti"),
  images: path.join(ROOT, "public", "images", "publications", "articoli"),
};

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function rel(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

export function fail(message, code = 1) {
  console.error(`\n[ERRORE] ${message}`);
  process.exit(code);
}

export function arg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? String(process.argv[index + 1] ?? "") : fallback;
}

export function has(name) {
  return process.argv.includes(`--${name}`);
}

export function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function yaml(value) {
  return JSON.stringify(String(value));
}

export function readJson(file) {
  if (!fs.existsSync(file)) fail(`File non trovato: ${rel(file)}`);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`JSON non valido in ${rel(file)}: ${error.message}`);
  }
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function run(command, args, label, options = {}) {
  console.log(`\n[${label}] ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    if (options.capture) {
      if (result.stdout) console.error(result.stdout);
      if (result.stderr) console.error(result.stderr);
    }
    fail(`${label} non superato.`);
  }
  return result;
}

export function getInboxFolders() {
  ensureDir(PATHS.inbox);
  return fs.readdirSync(PATHS.inbox, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => path.join(PATHS.inbox, entry.name));
}

export function selectInboxFolder() {
  const requested = arg("folder");
  if (requested) {
    const candidate = path.isAbsolute(requested)
      ? requested
      : path.join(PATHS.inbox, requested);
    if (!fs.existsSync(candidate)) fail(`Cartella non trovata: ${rel(candidate)}`);
    return candidate;
  }

  const folders = getInboxFolders();
  if (folders.length === 0) {
    fail(`Nessuna cartella trovata in ${rel(PATHS.inbox)}.`);
  }
  if (folders.length > 1) {
    console.error("\nSono presenti più pubblicazioni:");
    folders.forEach((folder) => console.error(`- ${path.basename(folder)}`));
    fail('Specificare: --folder "nome-cartella"');
  }
  return folders[0];
}

export function statePath(slug) {
  return path.join(PATHS.state, `${slug}.json`);
}

export function loadState(slug) {
  return readJson(statePath(slug));
}

export function saveState(state) {
  state.updatedAt = new Date().toISOString();
  writeJson(statePath(state.slug), state);
}

export function assertStage(state, allowed) {
  if (!allowed.includes(state.stage)) {
    fail(`Stato non valido: "${state.stage}". Stati ammessi: ${allowed.join(", ")}.`);
  }
}
