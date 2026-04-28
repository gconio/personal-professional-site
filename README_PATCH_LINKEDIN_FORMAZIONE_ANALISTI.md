# Patch articolo LinkedIn - La formazione degli analisti

Questa patch aggiunge alla sezione Pubblicazioni l'articolo:

- La formazione degli analisti - dialogo con Irene Piccolo
- Pubblicato su LinkedIn il 25 settembre 2025
- Con PDF scaricabile dalla scheda individuale

La patch include anche la versione aggiornata della pagina `src/pages/pubblicazioni/index.astro`, mantenendo la struttura senza la sezione "Progetti editoriali".

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-linkedin-formazione-analisti-patch\APPLICA_PATCH_LINKEDIN_FORMAZIONE_ANALISTI.ps1
npm run build
git add .
git commit -m "Add LinkedIn article on analyst training"
git push
```
