import fs from "node:fs";
import path from "node:path";
import {
  PATHS, arg, assertStage, ensureDir, fail, loadState, rel, run, saveState, yaml,
} from "./common.mjs";

const slug = arg("slug");
if (!slug) fail('Specificare lo slug: --slug "nome-articolo"');

const state = loadState(slug);
assertStage(state, ["prepared", "verified"]);

const data = state.extracted;
const sourcePdf = path.join(PATHS.root, state.inputs.pdf);
const sourceImage = state.inputs.image ? path.join(PATHS.root, state.inputs.image) : null;

const markdownDestination = path.join(PATHS.content, `${slug}.md`);
const pdfDestination = path.join(PATHS.pdf, `${slug}.pdf`);
const imageExtension = sourceImage ? path.extname(sourceImage).toLowerCase() : ".png";
const imageDestination = path.join(PATHS.images, `${slug}-thumbnail${imageExtension}`);

if (fs.existsSync(markdownDestination) && state.stage !== "verified") {
  fail(`Esiste già una scheda con lo stesso slug: ${rel(markdownDestination)}`);
}

ensureDir(PATHS.content);
ensureDir(PATHS.pdf);
ensureDir(PATHS.images);

fs.copyFileSync(sourcePdf, pdfDestination);
if (sourceImage) fs.copyFileSync(sourceImage, imageDestination);

const pdfUrl = `/documenti/${slug}.pdf`;
const cover = `/images/publications/articoli/${slug}-thumbnail${imageExtension}`;
const topics = data.topics.length
  ? data.topics
  : ["Contenuto da verificare prima della pubblicazione."];

const markdown = `---
title: ${yaml(data.title)}
description: ${yaml(data.description)}
type: "Articolo online / contributo online"
year: ${Number(data.visibleFrom.slice(0, 4))}
visibleFrom: ${yaml(data.visibleFrom)}
publisher: "Giovanni Conio - Lab4Int"
cover: ${yaml(cover)}
theme: ${yaml(data.theme)}
pdfUrl: ${yaml(pdfUrl)}
link: ${yaml(pdfUrl)}
sourceStatus: "PDF consultabile e scaricabile"
license: "Tutti i diritti riservati"
tags:
${data.tags.map((tag) => `  - ${tag}`).join("\n")}
featured: true
order: 0
---

## Descrizione

${data.description}

## Temi principali

${topics.map((topic) => `- ${topic}`).join("\n")}

## Focus metodologico

${data.focus}
`;

fs.writeFileSync(markdownDestination, markdown, "utf8");

run("node", ["scripts/editorial/check-publication-profile.mjs", "--article", slug], "CONTROLLO SCHEDA");
run("npm", ["run", "build"], "BUILD ASTRO");

state.stage = "verified";
state.outputs = {
  markdown: rel(markdownDestination),
  pdf: rel(pdfDestination),
  image: sourceImage ? rel(imageDestination) : null,
  pageUrl: `/pubblicazioni/${slug}/`,
};
state.checks = {
  publicationProfile: "passed",
  astroBuild: "passed",
  thumbnail: sourceImage ? "present" : "missing",
};
saveState(state);

console.log("\n=== VERIFICA COMPLETATA ===");
console.log(`Scheda     : ${state.outputs.markdown}`);
console.log(`PDF        : ${state.outputs.pdf}`);
console.log(`Thumbnail  : ${state.outputs.image || "ASSENTE - da aggiungere prima del commit"}`);
console.log("Profilo    : OK");
console.log("Build      : OK");
console.log("\nPasso successivo:");
console.log(`npm run editorial:preview -- --slug "${slug}"`);
