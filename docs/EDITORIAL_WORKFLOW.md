# Editorial Workflow

## Flusso standard

```text
Ricerca
  ↓
Proposta editoriale
  ↓
APPROVO IL TEMA
  ↓
Bozza
  ↓
Revisione umana
  ↓
APPROVO IL CONTENUTO
  ↓
Branch editorial/*
  ↓
Patch minima
  ↓
CI
  ↓
Pull Request e preview
  ↓
Verifica umana
  ↓
AUTORIZZO IL MERGE E LA PUBBLICAZIONE
  ↓
Merge
  ↓
Deploy
  ↓
Verifica post-deploy
```

## Classi di intervento

| Classe | Descrizione | Controlli minimi |
|---|---|---|
| E0 | refuso o link | build + PR |
| E1 | nuova risorsa | verifica fonte + build + preview |
| E2 | nuovo articolo | tre gate + build + preview |
| E3 | pubblicazione o PDF | file check + viewer + preview |
| E4 | intervista o video | metadata + embed + preview |
| E5 | struttura, componenti o configurazione | workflow tecnico separato |

## Branch

- `editorial/article-<slug>`
- `editorial/resource-<slug>`
- `editorial/interview-<slug>`
- `editorial/fix-<slug>`

Un branch deve contenere un solo intervento logico.

## Criteri di accettazione

Una Pull Request editoriale è pronta per la revisione solo quando:

- la modifica corrisponde alla richiesta;
- non include file estranei;
- la build termina con esito positivo;
- asset e collegamenti locali esistono;
- il contenuto approvato non è stato alterato;
- rischi e rollback sono dichiarati.
