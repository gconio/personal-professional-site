# ADR-006 — CAE Mission Planner

## Stato

Accepted — v0.4.0

## Contesto

Il modulo Opportunity Radar identifica opportunità editoriali, ma non le trasforma in unità di lavoro coordinate. La fase successiva richiede un livello di pianificazione che aggreghi opportunità correlate, definisca deliverable, stimi l'impegno e produca una coda ordinata.

## Decisione

È introdotto il modulo **Mission Planner**, deterministico e human-in-the-loop.

Il modulo:

- legge `artifacts/editorial/intelligence/opportunity-radar.json`;
- accetta esclusivamente lo schema Radar `0.3.1`;
- aggrega i gap di copertura e di prodotto relativi allo stesso dominio;
- crea missioni autonome di content repurposing;
- accorpa i classification gap in una missione di manutenzione;
- applica quote e un limite massimo configurabile;
- produce `mission-plan.json` e `MISSION_PLAN.md`;
- assegna dipendenze e ordine di coda;
- non modifica i contenuti e non esegue pubblicazioni.

## Modello di governance

Ogni missione nasce con:

- `status: proposed`;
- `approvalRequired: true`;
- `executionAuthorized: false`;
- `humanInTheLoop: true`.

La Mission Queue è una proposta di pianificazione. Non costituisce autorizzazione all'esecuzione.

## Conseguenze

### Positive

- passaggio esplicito da analisi a pianificazione;
- riduzione della duplicazione tra opportunità correlate;
- deliverable ordinati e stimati;
- tracciabilità completa verso le opportunità sorgente;
- base pronta per una futura Approval Queue.

### Limiti

- le stime sono convenzionali e configurabili;
- il planner non valuta capacità disponibile o calendario;
- non crea branch, file editoriali, draft o pubblicazioni;
- l'approvazione resta esterna al modulo.

## Output

- `artifacts/editorial/intelligence/mission-plan.json`
- `artifacts/editorial/intelligence/MISSION_PLAN.md`
