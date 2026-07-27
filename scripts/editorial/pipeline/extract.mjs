import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { PATHS, ensureDir, fail } from "./common.mjs";

function decodeXml(text) {
  return text
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function readDocx(file) {
  if (process.platform !== "win32") {
    fail("L'estrazione DOCX della v1.0 è configurata per Windows PowerShell.");
  }

  const temp = path.join(PATHS.root, ".editorial", ".tmp-docx");
  fs.rmSync(temp, { recursive: true, force: true });
  ensureDir(temp);

  const zipPath = path.join(temp, "document.zip");
  fs.copyFileSync(file, zipPath);

  const result = spawnSync("powershell.exe", [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-WindowStyle",
    "Hidden",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `Expand-Archive -LiteralPath '${zipPath.replaceAll("'", "''")}' -DestinationPath '${temp.replaceAll("'", "''")}' -Force`,
  ], {
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status !== 0) {
    fail(`Impossibile estrarre il DOCX:\n${result.stderr || result.stdout}`);
  }

  const documentXml = path.join(temp, "word", "document.xml");
  if (!fs.existsSync(documentXml)) {
    fail("DOCX non valido: word/document.xml assente.");
  }

  const text = decodeXml(fs.readFileSync(documentXml, "utf8"));
  fs.rmSync(temp, { recursive: true, force: true });
  return text;
}

export function readSource(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".docx") return readDocx(file);
  if ([".md", ".txt"].includes(ext)) return fs.readFileSync(file, "utf8");
  fail(`Formato sorgente non supportato: ${ext}`);
}

function cleanExtractedLine(line) {
  return String(line)
    .trim()
    // Rimuove artefatti di posizionamento Word/PDF eventualmente inglobati
    // all'inizio del testo, ad esempio: left244275400left2540682Titolo.
    .replace(/^(?:(?:left|top|right|bottom)-?\d+)+/i, "")
    .trim();
}

export function normalizeLines(text) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map(cleanExtractedLine)
    .filter(Boolean);
}
