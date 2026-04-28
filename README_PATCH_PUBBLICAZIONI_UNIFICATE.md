# Patch — Pubblicazioni unificate

Questa patch fonde la precedente sezione "Analisi" dentro "Pubblicazioni".

## Cosa fa

- Sposta i documenti AIAIG dentro `src/content/pubblicazioni/`.
- Mantiene le quattro sezioni editoriali:
  1. Libri
  2. Progetti editoriali
  3. Paper e contributi dottrinali
  4. Articoli e contributi online
- Rimuove "Analisi" dal menu principale.
- Trasforma `/analisi/` in una pagina ponte verso `/pubblicazioni/`.
- Lascia il download PDF solo nelle schede individuali.

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-pubblicazioni-unificate-patch\APPLICA_PATCH_PUBBLICAZIONI_UNIFICATE.ps1
npm run build
git add .
git commit -m "Merge analysis content into publications"
git push
```
