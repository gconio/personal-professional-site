# Patch — Risorse OSINT italiane

Questa patch aggiunge tre nuove risorse alla sezione `Risorse consigliate`:

- Proteggimi
- Mirko Lapi — OSINT · Intelligence
- OSINTITALIA

## File aggiunti

- `src/content/risorse/proteggimi.md`
- `src/content/risorse/mirko-lapi-osint-intelligence.md`
- `src/content/risorse/osintitalia.md`

## Applicazione

Dalla root del progetto:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\lab4int-risorse-osint-italia-patch\APPLICA_PATCH_RISORSE_OSINT_ITALIA.ps1
npm run build
```
