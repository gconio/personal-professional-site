# Lab4Int Editorial Dashboard

La dashboard v0.5 trasforma i report JSON della pipeline in una vista HTML statica e consultabile localmente.

## Comando

```bash
npm run editorial:dashboard
```

Il comando richiede che siano già presenti:

- `artifacts/editorial/editorial-index.json`;
- `artifacts/editorial/editorial-quality-report.json`;
- `artifacts/editorial/editorial-governance-report.json`.

L'esecuzione di `npm run editorial:check` genera questi report nell'ordine corretto.

## Output

- `artifacts/editorial/dashboard/index.html`;
- `artifacts/editorial/dashboard/dashboard-data.json`.

La pagina HTML è autonoma: non carica librerie, font, script o risorse da servizi esterni. Può essere aperta direttamente dal filesystem oppure scaricata dagli artefatti della GitHub Action.

## Contenuti visualizzati

- KPI complessivi;
- distribuzione `current`, `review-due`, `stale` e `undated`;
- priorità P1, P2 e P3;
- stato per collezione;
- coda operativa P1/P2 con ricerca e filtri;
- warning di qualità raggruppati per codice;
- copertura per categoria;
- timestamp dei report sorgente.

## Perimetro e sicurezza

La dashboard è un artefatto diagnostico, non una pagina pubblica del sito. Non modifica contenuti, non interroga URL esterni e non trasmette dati. La cartella `artifacts/editorial/` resta esclusa dal versionamento Git.
