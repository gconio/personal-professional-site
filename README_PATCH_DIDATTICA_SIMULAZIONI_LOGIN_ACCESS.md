# Patch — Nuova immagine Didattica / Simulazioni intelligence

Questa patch sostituisce l'immagine iniziale della scheda corso **Simulazioni intelligence e crisis management** con la nuova schermata di accesso della piattaforma Intel Sim.

## File aggiornato

- `src/content/corsi/simulazioni-intelligence.md`

## Asset aggiunto

- `public/images/courses/simulazioni-intelligence-crisis-management-login.png`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-didattica-simulazioni-login-access-patch\APPLICA_PATCH_DIDATTICA_SIMULAZIONI_LOGIN_ACCESS.ps1
npm run build
git add .
git commit -m "Update simulation course login image"
git push
```
