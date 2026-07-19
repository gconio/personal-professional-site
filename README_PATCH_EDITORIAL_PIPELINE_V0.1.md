# Lab4Int Editorial Pipeline v0.1 — Governance and CI Baseline

## Scopo

Questa patch introduce esclusivamente:

- contratto operativo degli agenti;
- policy editoriale;
- workflow documentato;
- baseline del modello dei contenuti;
- template delle Pull Request;
- CI GitHub per installazione e build.

## Non modifica

- contenuti editoriali;
- layout;
- componenti;
- stili;
- `package.json`;
- `package-lock.json`;
- configurazione Astro;
- configurazione Cloudflare;
- secrets;
- meccanismi di pubblicazione.

## Applicazione

Eseguire dalla cartella del repository:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\apply_editorial_pipeline_v0.1.ps1
```

Lo script:

1. verifica repository e working tree;
2. richiede di trovarsi su `main`;
3. crea il branch `chore/editorial-pipeline-v0.1`;
4. copia esclusivamente i file della baseline;
5. esegue `npm ci` e `npm run build`;
6. mostra il diff;
7. non effettua commit, push, merge o deploy.

## Passaggi successivi

Dopo esito positivo:

```powershell
git add AGENTS.md EDITORIAL_POLICY.md docs .github README_PATCH_EDITORIAL_PIPELINE_V0.1.md
git commit -m "Add editorial pipeline governance and CI baseline"
git push -u origin chore/editorial-pipeline-v0.1
```

Aprire quindi una Pull Request verso `main`.

## Rollback locale

Prima del commit:

```powershell
git switch main
git branch -D chore/editorial-pipeline-v0.1
```

Dopo il commit ma prima del merge, chiudere la Pull Request ed eliminare il branch.

## Policy

Nessun contenuto deve essere pubblicato senza approvazione esplicita di Giovanni Conio.
