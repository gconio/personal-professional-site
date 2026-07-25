import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ROOT } from "./lib.mjs";

function argument(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? String(process.argv[index + 1] ?? "") : fallback;
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function yaml(value) {
  return JSON.stringify(String(value));
}

const title = argument("title");
if (!title) {
  console.error('Uso: npm run editorial:new-publication -- --title "Titolo" --description "Descrizione" [--slug "slug"]');
  process.exit(1);
}

const description = argument("description");
if (!description) {
  console.error("Errore: --description è obbligatorio.");
  process.exit(1);
}

const slug = argument("slug", slugify(title));
const year = Number(argument("year", String(new Date().getFullYear())));
const visibleFrom = argument("visible-from", new Date().toISOString().slice(0, 10));
const theme = argument("theme", "Intelligence analysis e metodologia");
const tags = argument(
  "tags",
  "intelligence analysis,metodologia intelligence,structured analytic techniques,analisi strategica,Lab4Int"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(`Errore: slug non valido: ${slug}`);
  process.exit(1);
}

const destination = path.join(ROOT, "src", "content", "pubblicazioni", `${slug}.md`);
if (fs.existsSync(destination)) {
  console.error(`Errore: il file esiste già: ${path.relative(ROOT, destination)}`);
  process.exit(1);
}

const pdfUrl = `/documenti/${slug}.pdf`;
const cover = `/images/publications/articoli/${slug}-thumbnail.png`;

const content = `---
title: ${yaml(title)}
description: ${yaml(description)}
type: "Articolo online / contributo online"
year: ${year}
visibleFrom: ${yaml(visibleFrom)}
publisher: "Giovanni Conio - Lab4Int"
cover: ${yaml(cover)}
theme: ${yaml(theme)}
pdfUrl: ${yaml(pdfUrl)}
link: ${yaml(pdfUrl)}
sourceStatus: "PDF consultabile e scaricabile"
license: "Tutti i diritti riservati"
tags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
featured: true
order: 0
---

## Descrizione

Inserire una sintesi estesa del contributo.

## Temi principali

- Inserire il primo tema.
- Inserire il secondo tema.
- Inserire il terzo tema.

## Focus metodologico

Spiegare il contributo metodologico dell'articolo e il collegamento con l'analisi intelligence.

## Disponibilità

Il contributo è disponibile in formato PDF.

[Scarica il PDF](${pdfUrl})
`;

fs.writeFileSync(destination, content, "utf8");

console.log(`Scheda creata: ${path.relative(ROOT, destination)}`);
console.log(`PDF atteso: public${pdfUrl}`);
console.log(`Thumbnail attesa: public${cover}`);
console.log("");
console.log("Prima della pubblicazione:");
console.log("1. completare le quattro sezioni della scheda;");
console.log("2. copiare PDF e thumbnail nei percorsi indicati;");
console.log("3. eseguire npm run editorial:check.");