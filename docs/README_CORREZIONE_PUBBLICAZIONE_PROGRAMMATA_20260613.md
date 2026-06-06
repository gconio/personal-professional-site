# Correzione pubblicazione programmata 13/06/2026

Questa patch corregge due aspetti:

1. `src/pages/pubblicazioni/index.astro` nasconde la card della pubblicazione programmata fino alla data `visibleFrom`.
2. `src/pages/pubblicazioni/[slug].astro` forza la formattazione della data in `Europe/Rome`, evitando che `2026-06-13T00:00:00+02:00` venga visualizzato come 12 giugno durante la build in ambiente UTC.

Dopo la copia dei file:

```powershell
npm run build
git status --short
git add src/pages/pubblicazioni/index.astro src/pages/pubblicazioni/[slug].astro docs/README_CORREZIONE_PUBBLICAZIONE_PROGRAMMATA_20260613.md
git commit -m "Fix scheduled publication visibility"
git push
```
