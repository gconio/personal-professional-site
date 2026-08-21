import { execFileSync } from "node:child_process";
import { failWith } from "./lib.mjs";

const branch = process.env.GITHUB_HEAD_REF || process.env.BRANCH_NAME || "";
const contentMatch = branch.match(
  /^content\/([a-z0-9]+(?:-[a-z0-9]+)*)$/
);
const isContentBranch = branch.startsWith("content/");
const isLegacyEditorialBranch = branch.startsWith("editorial/");
const enforce =
  process.argv.includes("--enforce") ||
  process.env.EDITORIAL_SCOPE_ENFORCE === "true" ||
  isLegacyEditorialBranch ||
  isContentBranch;

if (!enforce) {
  console.log(
    `Controllo perimetro non applicato al branch: ${branch || "(locale)"}`
  );
  process.exit(0);
}

if (isContentBranch && !contentMatch) {
  failWith(
    [
      `branch content non valido: ${branch}`,
      "formato richiesto: content/<slug-kebab-case>"
    ],
    "Controllo perimetro fallito"
  );
  process.exit();
}

const base =
  process.env.EDITORIAL_BASE_REF ||
  process.env.GITHUB_BASE_REF ||
  "main";

let output;

try {
  output = execFileSync(
    "git",
    ["diff", "--name-only", `origin/${base}...HEAD`],
    { encoding: "utf8" }
  );
} catch (error) {
  failWith(
    [
      `impossibile calcolare il diff rispetto a origin/${base}: ${error.message}`
    ],
    "Controllo perimetro fallito"
  );
  process.exit();
}

const files = output
  .split(/\r?\n/)
  .filter(Boolean)
  .map((file) => file.replaceAll("\\", "/"))
  .sort();

if (contentMatch) {
  const slug = contentMatch[1];
  const allowedImageExtensions = ["png", "jpg", "jpeg", "webp"];
  const coverPrefix = `incoming/pubblicazioni/${slug}/cover.`;
  const thumbnailPrefix =
    `public/images/publications/articoli/${slug}-thumbnail.`;

  const coverCandidates = files.filter(
    (file) => file.startsWith(coverPrefix)
  );
  const thumbnailCandidates = files.filter(
    (file) => file.startsWith(thumbnailPrefix)
  );

  const imageErrors = [];

  if (coverCandidates.length !== 1) {
    imageErrors.push(
      `attesa esattamente una cover per content/${slug}; rilevate: ${coverCandidates.length}`
    );
  }

  if (thumbnailCandidates.length !== 1) {
    imageErrors.push(
      `attesa esattamente una thumbnail per content/${slug}; rilevate: ${thumbnailCandidates.length}`
    );
  }

  const coverExtension =
    coverCandidates.length === 1
      ? coverCandidates[0].slice(coverPrefix.length)
      : "";

  const thumbnailExtension =
    thumbnailCandidates.length === 1
      ? thumbnailCandidates[0].slice(thumbnailPrefix.length)
      : "";

  if (
    coverCandidates.length === 1 &&
    !allowedImageExtensions.includes(coverExtension)
  ) {
    imageErrors.push(
      `estensione cover non supportata per content/${slug}: .${coverExtension || "(vuota)"}`
    );
  }

  if (
    thumbnailCandidates.length === 1 &&
    !allowedImageExtensions.includes(thumbnailExtension)
  ) {
    imageErrors.push(
      `estensione thumbnail non supportata per content/${slug}: .${thumbnailExtension || "(vuota)"}`
    );
  }

  if (
    coverCandidates.length === 1 &&
    thumbnailCandidates.length === 1 &&
    allowedImageExtensions.includes(coverExtension) &&
    allowedImageExtensions.includes(thumbnailExtension) &&
    coverExtension !== thumbnailExtension
  ) {
    imageErrors.push(
      `estensioni immagine non coerenti per content/${slug}: cover .${coverExtension}, thumbnail .${thumbnailExtension}`
    );
  }

  if (imageErrors.length) {
    failWith(
      imageErrors,
      "Controllo perimetro content fallito"
    );
    process.exit();
  }

  const expected = [
    `.editorial/state/${slug}.json`,
    coverCandidates[0],
    `incoming/pubblicazioni/${slug}/document.pdf`,
    `incoming/pubblicazioni/${slug}/editorial-studio.json`,
    `incoming/pubblicazioni/${slug}/metadata.json`,
    `incoming/pubblicazioni/${slug}/source.docx`,
    `public/documenti/${slug}.pdf`,
    thumbnailCandidates[0],
    `src/content/pubblicazioni/${slug}.md`
  ].sort();

  const unexpected = files.filter(
    (file) => !expected.includes(file)
  );
  const missing = expected.filter(
    (file) => !files.includes(file)
  );

  const errors = [
    ...unexpected.map(
      (file) => `file inatteso per content/${slug}: ${file}`
    ),
    ...missing.map(
      (file) =>
        `file obbligatorio mancante per content/${slug}: ${file}`
    )
  ];

  if (errors.length) {
    failWith(errors, "Controllo perimetro content fallito");
  } else {
    console.log(
      `Perimetro content/${slug} valido: ${files.length} file esatti.`
    );
  }
} else {
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
      !allowedPrefixes.some(
        (prefix) => file.startsWith(prefix)
      )
  );

  if (forbidden.length) {
    failWith(
      forbidden.map(
        (file) =>
          `file fuori dal perimetro editoriale ordinario: ${file}`
      ),
      "Controllo perimetro fallito"
    );
  } else {
    console.log(
      `Perimetro editoriale valido: ${files.length} file modificati.`
    );
  }
}
