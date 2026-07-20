# ADR-005 — Opportunity Radar e Strategic Coverage Model

## Stato

Accepted — CAE v0.3.1.

## Contesto

La v0.3.0 misurava i gap di copertura rispetto a tutte le discipline monitorate. Questo produceva falsi positivi: l'assenza di contenuti SIGINT, GEOINT o SOCMINT veniva trattata come una lacuna anche quando tali discipline non appartenevano al presidio editoriale prioritario di Lab4Int.

## Decisione

L'Opportunity Radar separa due livelli:

1. **tassonomia di dominio**, che descrive l'universo concettuale dell'intelligence;
2. **Strategic Coverage Model**, che definisce i domini che Lab4Int intende presidiare e i relativi obiettivi quantitativi.

Solo i domini inclusi in `strategicDomains` possono generare automaticamente un `discipline-coverage-gap` o un `editorial-product-gap`. I domini elencati in `taxonomyOnlyDomains` restano classificabili ma non producono gap di copertura.

Il Radar applica inoltre quote per famiglia di opportunità e limita l'output a un massimo configurabile di candidati, così da evitare che la coda di classificazione o un'altra categoria saturi il quadro decisionale.

## Flusso

```text
Editorial Inventory
        ↓
Knowledge Model
        ↓
Strategic Coverage Model
        ↓
Opportunity Radar
        ↓
Mission Planner (fase successiva)
```

## Vincolo di governance

Un'opportunità è una raccomandazione analitica. Non autorizza pubblicazione, modifica del sito, creazione automatica di contenuti o apertura automatica di una missione.
