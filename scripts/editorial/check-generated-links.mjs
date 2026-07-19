import fs from "node:fs";
import path from "node:path";
import { ROOT, failWith, walkFiles } from "./lib.mjs";

const dist = path.join(ROOT, "dist");
if (!fs.existsSync(dist)) {
  failWith(["cartella dist assente: eseguire prima npm run build"], "Controllo link fallito");
  process.exit();
}

const htmlFiles = walkFiles(dist, ".html");
const errors = [];
let checked = 0;

function targetExists(reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || clean === "/") return fs.existsSync(path.join(dist, "index.html"));
  const relative = clean.replace(/^\/+/, "");
  const candidates = [
    path.join(dist, relative),
    path.join(dist, relative, "index.html"),
    path.join(dist, `${relative}.html`)
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const regex = /\b(?:href|src)=["']([^"']+)["']/gi;
  for (const match of html.matchAll(regex)) {
    const reference = match[1];
    if (
      !reference.startsWith("/") ||
      reference.startsWith("//") ||
      reference.startsWith("/cdn-cgi/") ||
      reference.startsWith("/api/")
    ) {
      continue;
    }

    checked += 1;
    if (!targetExists(reference)) {
      errors.push(
        `${path.relative(ROOT, file).replaceAll("\\", "/")}: destinazione locale non generata: ${reference}`
      );
    }
  }
}

if (errors.length) {
  failWith(errors, "Controllo dei collegamenti generati fallito");
} else {
  console.log(
    `Controllo collegamenti completato: ${checked} riferimenti locali verificati in ${htmlFiles.length} pagine HTML.`
  );
}
