# Lab4Int Editorial Pipeline v0.5

## Editorial Dashboard

La milestone introduce una dashboard HTML statica che aggrega inventario, quality report e governance report.

### Aggiunte

- comando `editorial:dashboard`;
- generatore `scripts/editorial/dashboard-report.mjs`;
- dashboard HTML autonoma e dati JSON consolidati;
- KPI, tabelle, coda operativa e filtri locali;
- documentazione dedicata;
- integrazione in `editorial:check` e nella GitHub Action.

### Vincoli

- nessuna dipendenza npm aggiuntiva;
- nessuna chiamata esterna;
- nessuna modifica automatica ai contenuti;
- nessuna pubblicazione della dashboard nel sito pubblico.
