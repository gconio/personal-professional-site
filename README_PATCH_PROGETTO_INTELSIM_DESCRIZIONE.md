# Patch — Pagina progetto IntelSim

Questa patch aggiorna la pagina del progetto:

`src/content/progetti/intel-sim-platform.md`

Il nuovo contenuto descrive la piattaforma per simulazioni intelligence e crisis management, includendo finalità, destinatari, ruoli, inject, output, scenari, sistema di valutazione VDR/QVA e durata minima suggerita di 8 ore.

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-progetto-intelsim-descrizione-patch\APPLICA_PATCH_PROGETTO_INTELSIM_DESCRIZIONE.ps1
npm run build
git add .
git commit -m "Update IntelSim project description"
git push
```
