# Patch — Commenti dei lettori sul Manuale

Questa patch abilita la pubblicazione manuale dei commenti approvati nella pagina del libro "Manuale per l’analisi intelligence".

## File aggiornati

- `src/content.config.ts`
- `src/pages/pubblicazioni/[slug].astro`

## File aggiunti

- `src/content/commenti-manuale/.gitkeep`
- `docs/templates/commento-manuale-template.md`

## Flusso operativo

1. Ricevi il commento via email dal form.
2. Verifichi pertinenza, consenso e pubblicabilità.
3. Duplichi il template:
   `docs/templates/commento-manuale-template.md`
4. Crei un nuovo file in:
   `src/content/commenti-manuale/`
5. Rinomini il file nel formato:
   `YYYY-MM-DD-nome-cognome.md`
6. Compili `name`, `role`, `date`, `published`, `featured`, `consent`.
7. Esegui:
   `npm run build`
8. Commit e push.

## Nota privacy

Non inserire mai email, telefono o dati personali non necessari nei file Markdown pubblici.
