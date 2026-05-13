# Patch — Risorse: Studiare intelligence

Questa patch aggiunge una nuova sottosezione nella pagina `Risorse`:

- **Studiare intelligence**

La sezione raccoglie atenei, scuole, centri studi e percorsi formativi utili per approfondire intelligence, OSINT, security studies, geopolitica e cultura strategica.

## File aggiunti

- `src/content/risorse/domini-scuola-analisi-geopolitica.md`
- `src/content/risorse/unicampus-homeland-security-osint.md`
- `src/content/risorse/universita-udine-intelligence-emerging-technologies.md`
- `src/content/risorse/amistades-centro-studi.md`
- `src/content/risorse/kings-college-intelligence-international-security.md`
- `src/content/risorse/brunel-centre-intelligence-security-studies.md`
- `src/content/risorse/university-leicester-intelligence-security.md`
- `src/content/risorse/mercyhurst-intelligence-studies.md`

## File modificato

- `src/pages/risorse/index.astro`

## Applicazione

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\lab4int-risorse-studiare-intelligence-patch\APPLICA_PATCH_RISORSE_STUDIARE_INTELLIGENCE.ps1
npm run build
git add .
git commit -m "Add studying intelligence resources"
git push
```
