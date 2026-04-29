# PATCH — Uniformazione immagini progetto IntelSim

Questa patch aggiorna la pagina del progetto `intel-sim-platform` per:

- visualizzare tutte le schermate Admin e Controller con formato uniforme;
- usare la stessa proporzione visiva per tutte le immagini;
- rendere le anteprime più leggibili;
- consentire il click sull'immagine per aprire il file a piena dimensione.

## File aggiornato

- `src/content/progetti/intel-sim-platform.md`

## Asset inclusi

- `public/images/projects/intelsim/*.png`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-progetto-intelsim-viste-uniformi-patch\APPLICA_PATCH_PROGETTO_INTELSIM_VISTE_UNIFORMI.ps1
npm run build
```
