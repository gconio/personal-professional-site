# Patch - Visualizzatore PDF estratti Manuale

Questa patch aggiunge nella scheda del **Manuale per l'analisi intelligence** una sezione:

- **Sfoglia un estratto del Manuale**
- visualizzatore PDF dell'**Indice del volume**, mostrato per primo
- visualizzatore PDF delle **pagine selezionate**
- link per aprire ciascun estratto in una nuova scheda

## File modificati

- `src/content.config.ts`
- `src/content/pubblicazioni/manuale-analisi-intelligence.md`
- `src/pages/pubblicazioni/[slug].astro`

## File aggiunti

- `public/docs/pubblicazioni/manuale-preview/manuale-indice.pdf`
- `public/docs/pubblicazioni/manuale-preview/manuale-estratto-pagine.pdf`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-manuale-pdf-preview-patch\APPLICA_PATCH_MANUALE_PDF_PREVIEW.ps1
npm run build
git add .
git commit -m "Add PDF preview for Manuale"
git push
```

Nota: gli estratti sono file PDF pubblici dentro `public/`; quindi sono visibili e tecnicamente apribili dagli utenti.
