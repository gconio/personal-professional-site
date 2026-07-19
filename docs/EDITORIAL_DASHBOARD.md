# Editorial Dashboard

La dashboard aggrega inventario, quality report e governance report in un artefatto HTML locale.

## Comando

```bash
npm run editorial:dashboard
```

Output:

```text
artifacts/editorial/dashboard/index.html
artifacts/editorial/dashboard/dashboard-data.json
```

## Consolidamento v0.6

La v0.6 distingue due tipi di lavoro:

- **revisioni sostanziali**: contenuti `stale` o `review-due`;
- **completamento metadati**: contenuti `undated`.

Questa separazione evita di attribuire la stessa urgenza editoriale a problemi diversi.

La coda operativa include inoltre:

- filtro per tipo di intervento;
- filtro per priorità e stato;
- ricerca estesa alla motivazione;
- conteggio dinamico degli elementi visibili;
- collegamento diretto al file sorgente Markdown;
- esportazione CSV della vista filtrata;
- stampa della dashboard.

## Vincoli

La dashboard:

- non modifica i contenuti;
- non invia dati a servizi esterni;
- non richiede dipendenze aggiuntive;
- viene rigenerata dalla pipeline editoriale.
