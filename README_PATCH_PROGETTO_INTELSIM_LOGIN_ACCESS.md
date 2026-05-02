# Patch — nuova immagine accesso progetto IntelSim

Questa patch sostituisce la prima immagine della pagina progetto **Piattaforma per simulazioni intelligence e crisis management** con il nuovo screenshot fornito.

## File aggiornati

- `src/content/progetti/intel-sim-platform.md`

## Asset aggiunto

- `public/images/projects/intelsim/intelsim-login-access.png`

## Nota

La patch interviene solo sulla sezione **Progetti**. La pagina **Didattica / Simulazioni intelligence e crisis management** resta invariata e potrà essere aggiornata con una patch successiva.

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-progetto-intelsim-login-access-patch\APPLICA_PATCH_PROGETTO_INTELSIM_LOGIN_ACCESS.ps1
npm run build
git add .
git commit -m "Update IntelSim project login image"
git push
```
