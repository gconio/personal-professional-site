# Patch — Rimozione immagine formati del Manuale

Questa patch elimina dalla scheda del **Manuale per l’analisi intelligence** l’immagine ridondante con le due versioni del volume (cartaceo ed ebook) affiancate.

## File aggiornati

- `src/pages/pubblicazioni/[slug].astro`
- `src/content/pubblicazioni/manuale-analisi-intelligence.md`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-rimuovi-immagine-formati-manuale-patch\APPLICA_PATCH_RIMUOVI_IMMAGINE_FORMATI_MANUALE.ps1
npm run build
```
