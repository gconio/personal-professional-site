# Lab4Int Editorial Pipeline v0.2.1

## Contenuto della patch

- validatore specifico delle collezioni editoriali;
- controllo duplicati e asset locali;
- controllo dei collegamenti nell'output Astro;
- inventario editoriale JSON e Markdown;
- controllo del perimetro per branch `editorial/*`;
- nuovi script npm;
- CI editoriale aggiornata;
- contratto di aggiornamento controllato.

## Garanzie

La patch non:

- modifica contenuti esistenti;
- modifica `src/content.config.ts`;
- aggiunge dipendenze;
- modifica `package-lock.json`;
- effettua commit, push, merge o deploy.

## Applicazione

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\apply_editorial_pipeline_v0.2.1.ps1
```

Lo script verifica gli hash dei file v0.1 ricevuti come baseline. Se `package.json` o il workflow CI sono cambiati nel frattempo, interrompe l'operazione senza sovrascriverli.

## Test eseguiti dallo script

```text
npm ci
npm run editorial:validate
npm run editorial:inventory
npm run build
npm run editorial:links
git diff --check
```

## Branch

```text
chore/editorial-pipeline-v0.2.1
```

## Commit suggerito

```text
Add controlled editorial validation engine v0.2.1
```

## Correzioni v0.2.1

- gestione del BOM UTF-8 nel frontmatter;
- percorso del file negli errori di parsing;
- recupero sicuro da branch residui senza commit;
- rollback compatibile con Windows PowerShell;
- pulizia delle directory vuote generate dal tentativo fallito.

