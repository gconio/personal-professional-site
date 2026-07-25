import {
  arg, assertStage, fail, loadState, run, saveState,
} from "./common.mjs";

const slug = arg("slug");
if (!slug) fail('Specificare lo slug: --slug "nome-articolo"');

const state = loadState(slug);
assertStage(state, ["verified", "previewed"]);

console.log("\n=== ANTEPRIMA ===");
console.log("Il server Astro verrà avviato.");
console.log("Aprire nel browser:");
console.log("  http://localhost:4321/");
console.log("  http://localhost:4321/pubblicazioni/");
console.log(`  http://localhost:4321${state.outputs.pageUrl}`);
console.log("\nPer interrompere il server premere CTRL+C.");
console.log("Dopo la verifica visiva eseguire:");
console.log(`npm run editorial:publish-plan -- --slug "${slug}"`);

state.stage = "previewed";
saveState(state);

run("npm", ["run", "dev", "--", "--open"], "ANTEPRIMA ASTRO");
