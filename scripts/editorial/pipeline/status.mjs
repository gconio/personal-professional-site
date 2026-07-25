import fs from "node:fs";
import path from "node:path";
import { PATHS, ensureDir, readJson, rel } from "./common.mjs";

ensureDir(PATHS.state);
const files = fs.readdirSync(PATHS.state)
  .filter((name) => name.endsWith(".json"))
  .map((name) => path.join(PATHS.state, name));

if (files.length === 0) {
  console.log("Nessuna pubblicazione in lavorazione.");
  process.exit(0);
}

console.log("\nPUBBLICAZIONI IN LAVORAZIONE\n");
for (const file of files) {
  const state = readJson(file);
  console.log(`${state.slug}`);
  console.log(`  Titolo : ${state.extracted.title}`);
  console.log(`  Stato  : ${state.stage}`);
  console.log(`  File   : ${rel(file)}`);
}
