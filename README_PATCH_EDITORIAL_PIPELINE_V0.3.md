# Lab4Int Editorial Pipeline v0.3

## Milestone

Editorial Quality Gate & Reporting.

## Modifiche

- nuovo comando `editorial:quality`;
- report qualità JSON e Markdown;
- errori bloccanti distinti dai warning;
- controlli SEO euristici su titolo, descrizione e slug;
- controlli su immagini, PDF, YouTube ID, anni e destinazioni editoriali;
- integrazione nella Editorial CI;
- documentazione del quality gate.

## Garanzie

La patch non modifica contenuti esistenti, `src/content.config.ts`, `package-lock.json`, dipendenze, configurazione Cloudflare o secrets.

## Branch

```text
chore/editorial-pipeline-v0.3
```

## Commit suggerito

```text
Add editorial quality gate and reporting v0.3
```
