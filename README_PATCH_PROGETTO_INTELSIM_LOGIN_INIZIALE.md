# PATCH — Spostamento screenshot login IntelSim

Questa patch sposta lo screenshot finale del login nella parte iniziale della pagina del progetto **Piattaforma per simulazioni intelligence e crisis management**.

## Modifiche

- rimuove la sezione finale `La piattaforma in sintesi`;
- inserisce lo screenshot del login dopo `Visione del progetto` e prima di `Finalità`;
- mantiene una didascalia descrittiva sotto l'immagine.

## File aggiornato

- `src/content/progetti/intel-sim-platform.md`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-progetto-intelsim-login-iniziale-patch\APPLICA_PATCH_PROGETTO_INTELSIM_LOGIN_INIZIALE.ps1
npm run build
```
