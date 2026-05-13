# Patch — Risorse / Studiare intelligence

Questa patch aggiorna `src/pages/risorse/index.astro` aggiungendo la categoria `Studiare intelligence` alla pagina Risorse.

## Cosa corregge

I file Markdown già inseriti in `src/content/risorse/` con:

```yaml
category: "Studiare intelligence"
```

non comparivano perché la pagina Risorse mostra solo le categorie presenti in `categoryDefinitions`.

## Applicazione

Dalla root del progetto:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\lab4int-risorse-studiare-intelligence-index-patch\APPLICA_PATCH_RISORSE_STUDIARE_INTELLIGENCE_INDEX.ps1
npm run build
```
