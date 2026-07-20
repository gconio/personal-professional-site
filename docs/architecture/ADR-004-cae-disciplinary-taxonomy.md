# ADR-004 — Tassonomia disciplinare del CAE

## Decisione

Il Knowledge Model adotta i livelli:

```text
Domain
  -> Discipline
    -> Area
      -> Method
        -> Technique
          -> Concept
```

OSINT è classificata come **disciplina**, sullo stesso livello di HUMINT, SIGINT,
GEOINT, IMINT, MASINT, SOCMINT e delle altre discipline intelligence.

Non è ammessa una relazione gerarchica del tipo:

```text
OSINT
  -> SOCMINT
  -> GEOINT
  -> IMINT
```

Eventuali relazioni operative o metodologiche tra discipline saranno rappresentate
nel Knowledge Graph, non mediante subordinazione tassonomica.
