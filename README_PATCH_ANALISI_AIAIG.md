# Patch — Sezione Analisi con documenti AIAIG

Questa patch sostituisce i contenuti attuali della sezione `Analisi` con documenti pubblicati in ambito AIAIG.

## Contenuti inseriti

- Implicazioni etiche di una “intelligence compiacente”
- Nota Metodologica — Uno strumento per l’analista

## File aggiunti

- `src/content/analisi/aiaig-intelligence-compiacente.md`
- `src/content/analisi/aiaig-nota-metodologica.md`
- `public/docs/analisi/aiaig/*.pdf`
- `public/images/analisi/aiaig/*.png`

## File aggiornati

- `src/content.config.ts`
- `src/pages/analisi/index.astro`
- `src/pages/analisi/[slug].astro`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-analisi-aiaig-patch\APPLICA_PATCH_ANALISI_AIAIG.ps1
npm run build
git add .
git commit -m "Update analysis section with AIAIG papers"
git push
```
