# Patch — Menu principale: voce Risorse

Questa patch aggiorna il menu principale del sito inserendo la voce **Risorse** prima di **Contatti**.

## File modificato

- `src/components/Header.astro`

## Applicazione

Dalla root del progetto:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\lab4int-menu-risorse-patch\APPLICA_PATCH_MENU_RISORSE.ps1
npm run build
```

Poi:

```powershell
git add .
git commit -m "Add resources link to main navigation"
git push
```
