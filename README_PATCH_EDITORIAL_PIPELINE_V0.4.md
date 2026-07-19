# Lab4Int Editorial Pipeline v0.4

## Editorial Governance

La versione v0.4 introduce:

- comando `editorial:governance`;
- report JSON e Markdown;
- classificazione `current`, `review-due`, `stale`, `undated`;
- priorità P1/P2/P3;
- coda operativa dei contenuti da riesaminare;
- analisi di copertura per categoria, tipologia e anno;
- integrazione non bloccante nella GitHub Action;
- nessuna nuova dipendenza npm;
- nessuna modifica automatica ai contenuti.

## Verifica

```bash
npm ci
npm run editorial:check
```
