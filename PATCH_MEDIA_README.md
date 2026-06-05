# Patch Media e interventi — versione corretta

Questa versione usa il percorso corretto per la configurazione Astro Content Layer:

- `src/content.config.ts`

Non usare `src/content/config.ts` per questa codebase.

## File da copiare

- `src/content.config.ts`
- `src/pages/index.astro`
- `src/pages/media/index.astro`
- `src/content/media/intervista-youtube-intelligence-analysis.md`
- `src/content/media/dialogo-irene-piccolo.md`
- `src/styles/global.css`

## Verifica

```powershell
Test-Path .\src\content.config.ts
Test-Path .\src\content\media\intervista-youtube-intelligence-analysis.md
Test-Path .\src\content\media\dialogo-irene-piccolo.md
Select-String -Path .\src\content.config.ts -Pattern "const media|media }|risorsa, media"
Get-ChildItem .\src\content\media
npm run build
```
