import fs from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
export const CONTENT_ROOT = path.join(ROOT, "src", "content");
export const PUBLIC_ROOT = path.join(ROOT, "public");

export const COLLECTIONS = {
  corsi: {
    required: ["title", "description", "level", "duration", "format"],
    arrays: ["audience"],
    booleans: ["featured"],
    numbers: ["order"],
    assetFields: []
  },
  pubblicazioni: {
    required: ["title", "description", "year", "type"],
    arrays: ["tags"],
    booleans: ["featured"],
    numbers: ["year", "order"],
    assetFields: ["cover", "formatsImage", "previewIndexPdf", "previewSamplePdf", "pdfUrl"]
  },
  risorse: {
    required: ["title", "description", "type", "category", "level", "language"],
    arrays: ["tags"],
    booleans: ["featured"],
    numbers: ["year", "order"],
    urlFields: ["link"],
    assetFields: []
  },
  media: {
    required: ["title", "description", "date", "type", "format", "category"],
    arrays: ["tags"],
    booleans: ["featured"],
    numbers: ["order"],
    urlFields: ["externalUrl"],
    assetFields: ["thumbnail", "pdfUrl"]
  }
};

export function walkFiles(dir, extension = ".md") {
  if (!fs.existsSync(dir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...walkFiles(full, extension));
    else if (entry.isFile() && entry.name.endsWith(extension)) output.push(full);
  }
  return output.sort();
}

function stripQuotes(value) {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "") return "";
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => stripQuotes(item.trim()));
  }
  return stripQuotes(value);
}

export function parseMarkdownFile(file) {
  const rawText = fs.readFileSync(file, "utf8");
  const text = rawText.replace(/^\uFEFF/, "");
  const relativeFile = path.relative(ROOT, file).replaceAll("\\\\", "/");
  if (!text.startsWith("---")) {
    throw new Error(`${relativeFile}: frontmatter iniziale mancante`);
  }

  const end = text.indexOf("\n---", 3);
  if (end === -1) throw new Error(`${relativeFile}: frontmatter non chiuso`);

  const frontmatterText = text.slice(3, end).replace(/^\r?\n/, "");
  const body = text.slice(end + 4).replace(/^\r?\n/, "");
  const data = {};
  let activeArray = null;

  for (const originalLine of frontmatterText.split(/\r?\n/)) {
    const line = originalLine.replace(/\s+$/, "");
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const arrayMatch = line.match(/^\s*-\s+(.*)$/);
    if (arrayMatch && activeArray) {
      data[activeArray].push(stripQuotes(arrayMatch[1].trim()));
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/);
    if (!keyMatch) {
      throw new Error(`${relativeFile}: riga frontmatter non riconosciuta: ${line}`);
    }

    const [, key, raw = ""] = keyMatch;
    if (raw.trim() === "") {
      data[key] = [];
      activeArray = key;
    } else {
      data[key] = parseScalar(raw);
      activeArray = null;
    }
  }

  return {
    file,
    relativeFile: path.relative(ROOT, file).replaceAll("\\", "/"),
    slug: path.basename(file, path.extname(file)),
    data,
    body
  };
}

export function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

export function canonicalUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return String(value ?? "").trim();
  }
}

export function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value ?? ""));
}

export function isLocalPublicReference(value) {
  const text = String(value ?? "");
  return text.startsWith("/") && /\.[A-Za-z0-9]{2,8}(?:[?#].*)?$/.test(text);
}

export function localReferenceToFile(value) {
  const clean = String(value).split(/[?#]/, 1)[0].replace(/^\/+/, "");
  return path.join(PUBLIC_ROOT, ...clean.split("/"));
}

export function extractMarkdownLinks(body) {
  const links = [];
  const regex = /!?\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of body.matchAll(regex)) links.push(match[1]);
  return links;
}

export function loadCollections() {
  const records = [];
  for (const collection of Object.keys(COLLECTIONS)) {
    const directory = path.join(CONTENT_ROOT, collection);
    for (const file of walkFiles(directory)) {
      records.push({ collection, ...parseMarkdownFile(file) });
    }
  }
  return records;
}

export function failWith(errors, heading = "Controllo fallito") {
  console.error(`\n${heading}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
}
