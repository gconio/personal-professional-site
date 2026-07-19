import fs from "node:fs";
import {
  COLLECTIONS,
  canonicalUrl,
  extractMarkdownLinks,
  failWith,
  isExternalUrl,
  isLocalPublicReference,
  loadCollections,
  localReferenceToFile,
  normalize
} from "./lib.mjs";

const records = loadCollections();
const errors = [];
const warnings = [];

for (const record of records) {
  const schema = COLLECTIONS[record.collection];
  const { data, relativeFile } = record;

  for (const field of schema.required ?? []) {
    const value = data[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors.push(`${relativeFile}: campo obbligatorio mancante o vuoto: ${field}`);
    }
  }

  for (const field of schema.arrays ?? []) {
    if (data[field] !== undefined && !Array.isArray(data[field])) {
      errors.push(`${relativeFile}: ${field} deve essere un array`);
    }
  }

  for (const field of schema.booleans ?? []) {
    if (data[field] !== undefined && typeof data[field] !== "boolean") {
      errors.push(`${relativeFile}: ${field} deve essere booleano`);
    }
  }

  for (const field of schema.numbers ?? []) {
    if (data[field] !== undefined && typeof data[field] !== "number") {
      errors.push(`${relativeFile}: ${field} deve essere numerico`);
    }
  }

  for (const field of schema.urlFields ?? []) {
    const value = data[field];
    if (value !== undefined && value !== "" && !isExternalUrl(value)) {
      errors.push(`${relativeFile}: ${field} deve essere un URL http/https valido`);
    }
  }

  if (data.visibleFrom !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.visibleFrom))) {
    errors.push(`${relativeFile}: visibleFrom deve usare il formato YYYY-MM-DD`);
  }

  if (record.collection === "media" && Number.isNaN(Date.parse(String(data.date)))) {
    errors.push(`${relativeFile}: date non è una data valida`);
  }

  if (
    record.collection === "media" &&
    data.type === "video" &&
    !data.youtubeId &&
    !data.externalUrl
  ) {
    errors.push(`${relativeFile}: un video richiede youtubeId oppure externalUrl`);
  }

  const references = [
    ...(schema.assetFields ?? []).map((field) => ({ field, value: data[field] })),
    ...extractMarkdownLinks(record.body).map((value) => ({ field: "body", value }))
  ];

  for (const { field, value } of references) {
    if (!value || !isLocalPublicReference(value)) continue;
    const target = localReferenceToFile(value);
    if (!fs.existsSync(target)) {
      errors.push(`${relativeFile}: riferimento locale inesistente in ${field}: ${value}`);
    }
  }
}

for (const collection of Object.keys(COLLECTIONS)) {
  const collectionRecords = records.filter((record) => record.collection === collection);
  const titleMap = new Map();

  for (const record of collectionRecords) {
    const key = normalize(record.data.title);
    if (!key) continue;
    const previous = titleMap.get(key);
    if (previous) {
      errors.push(
        `${record.relativeFile}: titolo duplicato con ${previous.relativeFile}: ${record.data.title}`
      );
    } else {
      titleMap.set(key, record);
    }
  }
}

const resourceUrls = new Map();
for (const record of records.filter((item) => item.collection === "risorse")) {
  if (!record.data.link) continue;
  const key = canonicalUrl(record.data.link);
  const previous = resourceUrls.get(key);
  if (previous) {
    errors.push(
      `${record.relativeFile}: URL risorsa duplicato con ${previous.relativeFile}: ${record.data.link}`
    );
  } else {
    resourceUrls.set(key, record);
  }
}

const youtubeIds = new Map();
for (const record of records.filter((item) => item.collection === "media")) {
  if (!record.data.youtubeId) continue;
  const key = String(record.data.youtubeId).trim();
  const previous = youtubeIds.get(key);
  if (previous) {
    errors.push(
      `${record.relativeFile}: youtubeId duplicato con ${previous.relativeFile}: ${key}`
    );
  } else {
    youtubeIds.set(key, record);
  }
}

for (const warning of warnings) console.warn(`WARNING: ${warning}`);

if (errors.length) {
  failWith(errors, "Validazione editoriale fallita");
} else {
  console.log(
    `Validazione editoriale completata: ${records.length} contenuti controllati in ` +
      `${Object.keys(COLLECTIONS).length} collezioni.`
  );
}
