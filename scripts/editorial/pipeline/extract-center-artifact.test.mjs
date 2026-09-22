import assert from "node:assert/strict";
import { normalizeLines } from "./extract.mjs";

const title = "UN SEGNALE DEBOLE NON È ANCORA UN WARNING";

assert.deepEqual(
  normalizeLines(`center69680210140532523987${title}`),
  [title],
  "center<digits> deve essere rimosso dall'inizio della riga",
);

assert.deepEqual(
  normalizeLines(`left244275400center69680210140532523987${title}`),
  [title],
  "sequenze miste di artefatti di posizionamento devono essere rimosse",
);

assert.deepEqual(
  normalizeLines("centerpiece resta testo legittimo"),
  ["centerpiece resta testo legittimo"],
  "la parola center senza suffisso numerico non deve essere alterata",
);

console.log("PASS extract-center-artifact: center<digits> normalizzato correttamente.");