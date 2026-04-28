# Patch - Articoli LinkedIn in Pubblicazioni

Questa patch aggiunge gli articoli pubblicati su LinkedIn alla sezione `Pubblicazioni`, nella categoria `Articoli e contributi online`, con download locale dei PDF.

Include anche la rimozione della categoria `Progetti editoriali` dalla pagina `Pubblicazioni` e la rimozione del vecchio file `src/content/pubblicazioni/volume-sat.md`.

## File principali

- `src/pages/pubblicazioni/index.astro`
- `src/content/pubblicazioni/linkedin-*.md`
- `public/docs/pubblicazioni/linkedin/*.pdf`
- `public/images/publications/linkedin/*.png`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-linkedin-articoli-patch\APPLICA_PATCH_LINKEDIN_ARTICOLI.ps1
npm run build
git add .
git commit -m "Add LinkedIn articles to publications"
git push
```
