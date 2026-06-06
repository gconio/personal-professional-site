# Patch pubblicazione programmata - 13/06/2026

Contenuto predisposto:
- `public/documenti/quando-intelligence-fallisce.pdf`
- `public/images/publications/articoli/quando-intelligence-fallisce-thumbnail.png`
- `src/content/pubblicazioni/quando-intelligence-fallisce.md`

Modifiche incluse:
- `src/content.config.ts`: aggiunto campo opzionale `visibleFrom` alla collection `pubblicazione`.
- `src/pages/index.astro`: le ultime pubblicazioni includono anche contenuti programmati, nascosti lato browser fino alla data `visibleFrom`.
- `src/pages/pubblicazioni/[slug].astro`: la pagina dettaglio esiste già, ma contenuto, dati editoriali, CTA e PDF restano nascosti lato browser fino al 13/06/2026.
- `src/styles/global.css`: classi CSS per lo stato di pubblicazione programmata.

Comandi suggeriti dopo la copia nel repo:

```powershell
npm run check
npm run build
git status --short
git add src/content.config.ts src/pages/index.astro src/pages/pubblicazioni/[slug].astro src/styles/global.css src/content/pubblicazioni/quando-intelligence-fallisce.md public/documenti/quando-intelligence-fallisce.pdf public/images/publications/articoli/quando-intelligence-fallisce-thumbnail.png
git commit -m "Schedule intelligence failure publication"
git push
```

Nota:
questa è una pubblicazione nascosta lato browser. Il PDF, essendo in `public/documenti`, resta tecnicamente raggiungibile tramite URL diretto da chi conosce il percorso.
