import fs from "node:fs";
import path from "node:path";
import {
  PATHS, arg, assertStage, fail, loadState, rel, run, saveState,
} from "./common.mjs";

const slug = arg("slug");
if (!slug) fail('Specificare lo slug: --slug "nome-articolo"');

const state = loadState(slug);
assertStage(state, ["verified", "previewed", "ready"]);

run("git", ["status", "--short"], "STATO GIT");

const required = [
  state.outputs.markdown,
  state.outputs.pdf,
].filter(Boolean);

if (state.outputs.image) required.push(state.outputs.image);

for (const item of required) {
  if (!fs.existsSync(path.join(PATHS.root, item))) {
    fail(`Output atteso non trovato: ${item}`);
  }
}

if (!state.outputs.image) {
  fail("Thumbnail assente. Aggiungerla nella cartella inbox e ripetere prepare/verify prima del commit.");
}

state.stage = "ready";
saveState(state);

console.log("\n=== PIANO DI PUBBLICAZIONE ===");
console.log("Tutti i controlli tecnici sono superati.");
console.log("Nessun comando Git è stato eseguito automaticamente.");
console.log("\n1. Controllare ancora una volta:");
required.forEach((item) => console.log(`   - ${item}`));
console.log("\n2. Aggiungere i file:");
console.log(`git add ${required.map((item) => `"${item}"`).join(" ")}`);
console.log("\n3. Verificare lo staging:");
console.log("git diff --cached --stat");
console.log("git diff --cached");
console.log("\n4. Solo se il contenuto è corretto:");
console.log(`git commit -m "Publish ${state.extracted.title.replaceAll('"', "'")}"`);
console.log("git push");
