import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { ROOT, loadCollections, failWith } from "./lib.mjs";

const args = new Set(process.argv.slice(2));
const explicitArticleIndex = process.argv.indexOf("--article");
const explicitArticle =
  explicitArticleIndex >= 0 ? String(process.argv[explicitArticleIndex + 1] ?? "").trim() : "";

const auditAll = args.has("--all");
const changedOnly = args.has("--changed") || (!auditAll && !explicitArticle);

const requiredSections = [
  "## Descrizione",
  "## Temi principali",
  "## Focus metodologico",
  "## Disponibilità"
];

function normalized(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isLocalLab4IntArticle(record) {
  const type = normalized(record.data.type);
  const publisher = normalized(record.data.publisher);
  const localDestination = [record.data.pdfUrl, record.data.link]
    .filter(Boolean)
    .some((value) => String(value).startsWith("/"));

  return (
    (type.includes("articolo online") || type.includes("contributo online")) &&
    (publisher.includes("lab4int") || localDestination)
  );
}

function gitLines(argsList) {
  try {
    return execFileSync("git", argsList, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function changedPublicationFiles() {
  const tracked = [
    ...gitLines(["diff", "--name-only", "--diff-filter=ACMRT", "HEAD"]),
    ...gitLines(["diff", "--cached", "--name-only", "--diff-filter=ACMRT", "HEAD"])
  ];

  const untracked = gitLines(["ls-files", "--others", "--exclude-standard"]);

  return new Set(
    [...tracked, ...untracked]
      .map((item) => item.replaceAll("\\", "/"))
      .filter((item) => item.startsWith("src/content/pubblicazioni/"))
      .filter((item) => item.endsWith(".md") || item.endsWith(".mdx"))
  );
}

const allPublications = loadCollections().filter(
  (record) => record.collection === "pubblicazioni"
);

let recordsToCheck = [];

if (auditAll) {
  recordsToCheck = allPublications.filter(isLocalLab4IntArticle);
} else if (explicitArticle) {
  const expectedNames = new Set([
    explicitArticle,
    `${explicitArticle}.md`,
    `${explicitArticle}.mdx`
  ]);

  recordsToCheck = allPublications.filter((record) => {
    const fileName = path.basename(record.relativeFile);
    const slug = fileName.replace(/\.(md|mdx)$/i, "");
    return expectedNames.has(fileName) || expectedNames.has(slug);
  });

  if (!recordsToCheck.length) {
    failWith(
      [`Nessuna pubblicazione trovata per --article ${explicitArticle}`],
      "Controllo pubblicazione fallito"
    );
  }
} else if (changedOnly) {
  const changed = changedPublicationFiles();

  recordsToCheck = allPublications.filter((record) =>
    changed.has(record.relativeFile.replaceAll("\\", "/"))
  );
}

const errors = [];
const warnings = [];

for (const record of recordsToCheck.filter(isLocalLab4IntArticle)) {
  const { data, relativeFile, body } = record;

  const requiredFields = [
    "publisher",
    "cover",
    "theme",
    "pdfUrl",
    "link",
    "sourceStatus",
    "license"
  ];

  for (const field of requiredFields) {
    if (!String(data[field] ?? "").trim()) {
      errors.push(`${relativeFile}: profilo articolo Lab4Int incompleto; manca ${field}`);
    }
  }

  if (data.pdfUrl && data.link && data.pdfUrl !== data.link) {
    warnings.push(`${relativeFile}: link e pdfUrl puntano a destinazioni diverse`);
  }

  if (!Array.isArray(data.tags) || data.tags.length < 5) {
    errors.push(`${relativeFile}: sono richiesti almeno 5 tag per un articolo Lab4Int`);
  }

  for (const section of requiredSections) {
    if (!body.includes(section)) {
      errors.push(`${relativeFile}: sezione standard mancante: ${section}`);
    }
  }

  if (data.cover) {
    const coverPath = path.join(ROOT, "public", String(data.cover).replace(/^\/+/, ""));
    if (!fs.existsSync(coverPath)) {
      errors.push(`${relativeFile}: thumbnail inesistente: ${data.cover}`);
    }
  }

  if (data.pdfUrl) {
    const pdfPath = path.join(ROOT, "public", String(data.pdfUrl).replace(/^\/+/, ""));
    if (!fs.existsSync(pdfPath)) {
      errors.push(`${relativeFile}: PDF inesistente: ${data.pdfUrl}`);
    }
  }
}

for (const warning of warnings) {
  console.warn(`WARNING: ${warning}`);
}

if (auditAll) {
  if (errors.length) {
    console.warn("");
    console.warn("Audit completo delle pubblicazioni:");
    for (const error of errors) {
      console.warn(`- ${error}`);
    }
    console.warn("");
    console.warn(
      `Audit concluso con ${errors.length} non conformità storiche. La pubblicazione corrente non viene bloccata.`
    );
  } else {
    console.log(
      `Audit completo conforme: ${recordsToCheck.filter(isLocalLab4IntArticle).length} articoli Lab4Int controllati.`
    );
  }

  process.exit(0);
}

if (!recordsToCheck.length) {
  console.log("Nessuna scheda di pubblicazione nuova o modificata da controllare.");
  process.exit(0);
}

if (errors.length) {
  failWith(errors, "Controllo pubblicazione corrente fallito");
}

console.log(
  `Pubblicazione corrente conforme: ${recordsToCheck.filter(isLocalLab4IntArticle).length} schede controllate.`
);