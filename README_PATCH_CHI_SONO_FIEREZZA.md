# Patch — immagine 165° Corso Fierezza in “Chi sono”

Questa patch aggiorna la pagina `Chi sono`, inserendo l’immagine del 165° Corso “Fierezza” nel box **Formazione militare e incarichi di comando**.

## File modificato

- `src/pages/chi-sono.astro`

## Asset aggiunto

- `public/images/qualifications/165-corso-fierezza.png`

## Effetto

- l’immagine compare nel primo box della timeline professionale;
- l’immagine è cliccabile;
- al click si apre in una nuova scheda a dimensioni reali.

## Applicazione

Dalla root del progetto:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\lab4int-chi-sono-fierezza-patch\APPLICA_PATCH_CHI_SONO_FIEREZZA.ps1
npm run build
git add .
git commit -m "Add Fierezza emblem to profile page"
git push
```
