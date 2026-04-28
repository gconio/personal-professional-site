# Patch — Analisi con layout coerente con Pubblicazioni

Questa patch aggiorna la sezione `Analisi` affinché utilizzi lo stesso formato visivo della pagina `Pubblicazioni`:

- elenco per sezioni;
- card compatte con miniatura a sinistra;
- metadati ordinati;
- solo pulsante `Apri scheda` nella pagina principale;
- link al sito AIAIG e download PDF nella scheda individuale.

La patch mantiene nella sezione `Analisi` solo i documenti AIAIG inclusi:

- `Implicazioni etiche di una “intelligence compiacente”`;
- `Nota Metodologica — Uno strumento per l’analista`.

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-analisi-stile-pubblicazioni-patch\APPLICA_PATCH_ANALISI_STILE_PUBBLICAZIONI.ps1
npm run build
git add .
git commit -m "Align analysis section with publications layout"
git push
```
