import { execFileSync } from "node:child_process";
import { failWith } from "./lib.mjs";

const branch = process.env.GITHUB_HEAD_REF || process.env.BRANCH_NAME || "";
const enforce =
  process.argv.includes("--enforce") ||
  process.env.EDITORIAL_SCOPE_ENFORCE === "true" ||
  branch.startsWith("editorial/");

if (!enforce) {
  console.log(`Controllo perimetro non applicato al branch: ${branch || "(locale)"}`);
  process.exit(0);
}

const base = process.env.EDITORIAL_BASE_REF || process.env.GITHUB_BASE_REF || "main";
let output;

try {
  output = execFileSync(
    "git",
    ["diff", "--name-only", `origin/${base}...HEAD`],
    { encoding: "utf8" }
  );
} catch (error) {
  failWith(
    [`impossibile calcolare il diff rispetto a origin/${base}: ${error.message}`],
    "Controllo perimetro fallito"
  );
  process.exit();
}

const files = output.split(/\r?\n/).filter(Boolean);
const allowedPrefixes = [
  "src/content/corsi/",
  "src/content/media/",
  "src/content/pubblicazioni/",
  "src/content/risorse/",
  "public/images/",
  "public/docs/"
];
const allowedExact = [
  "docs/EDITORIAL_DELIVERY_LOG.md"
];

const forbidden = files.filter(
  (file) =>
    !allowedExact.includes(file) &&
    !allowedPrefixes.some((prefix) => file.startsWith(prefix))
);

if (forbidden.length) {
  failWith(
    forbidden.map((file) => `file fuori dal perimetro editoriale ordinario: ${file}`),
    "Controllo perimetro fallito"
  );
} else {
  console.log(`Perimetro editoriale valido: ${files.length} file modificati.`);
}
