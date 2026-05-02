# Patch — Commenti Manuale in lista verticale

Questa patch aggiorna la pagina dinamica delle pubblicazioni per modificare la sezione **Commenti dei lettori** nella scheda del Manuale.

## Modifiche

- I commenti vengono ordinati dal più recente al più vecchio sulla base del campo `date`.
- In caso di stessa data, viene usato l'`id` del file come ordinamento secondario discendente.
- Le card dei commenti non sono più disposte in griglia a colonne, ma in lista verticale: una card sotto l'altra, a tutta larghezza.

## File aggiornato

- `src/pages/pubblicazioni/[slug].astro`

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-commenti-manuale-lista-verticale-patch\APPLICA_PATCH_COMMENTI_MANUALE_LISTA_VERTICALE.ps1
npm run build
```
