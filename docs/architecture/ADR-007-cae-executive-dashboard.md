# ADR-007 — CAE Executive Dashboard

## Stato

Accepted — v0.4.1

## Contesto

Il CAE produce già artefatti strutturati tramite Inventory, Knowledge Model, Opportunity Radar e Mission Planner. I risultati sono tuttavia distribuiti tra file JSON e Markdown e richiedono consultazione manuale.

## Decisione

È introdotta una **Executive Dashboard in sola lettura** che consolida gli artefatti esistenti e genera:

- un modello JSON normalizzato;
- un report Markdown;
- una pagina HTML autonoma e apribile localmente.

La dashboard non introduce backend, database, endpoint, autenticazione, azioni remote o capacità di esecuzione.

## Input

- `artifacts/editorial/editorial-index.json`
- `artifacts/editorial/intelligence/knowledge-index.json`
- `artifacts/editorial/intelligence/opportunity-radar.json`
- `artifacts/editorial/intelligence/mission-plan.json`

## Output

- `artifacts/editorial/dashboard/cae-dashboard.json`
- `artifacts/editorial/dashboard/CAE_DASHBOARD.md`
- `artifacts/editorial/dashboard/index.html`

## Governance

Il modulo opera con:

- `readOnly: true`;
- `executionAuthorized: false`;
- `modifiesEditorialContent: false`.

## Conseguenze

### Positive

- visibilità immediata dello stato del CAE;
- KPI consolidati;
- copertura strategica leggibile;
- Mission Queue consultabile;
- pipeline architetturale visibile;
- base pronta per integrare l’Approval Workflow.

### Limiti

- la dashboard è statica;
- richiede rigenerazione dopo ogni aggiornamento degli artefatti;
- non permette approvazioni o modifiche;
- non viene pubblicata automaticamente sul sito.
