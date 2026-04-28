# Patch — rimozione pagina "Sito in costruzione"

Questa patch sostituisce la home temporanea con una home definitiva coerente con l'attuale struttura del sito Lab4Int.

## Modifiche

- Aggiorna `src/pages/index.astro`.
- Rimuove `src/pages/index_OLD.astro`, che altrimenti potrebbe generare una pagina pubblica non desiderata.
- Rimuove `docs/06_HOME_TEMPORANEA.md`, ormai non più necessaria.

## Come applicare

Dalla root del progetto:

```powershell
.\lab4int-rimuovi-home-costruzione-patch\APPLICA_PATCH_RIMUOVI_HOME_COSTRUZIONE.ps1
npm run build
git add .
git commit -m "Replace temporary construction homepage"
git push
```
