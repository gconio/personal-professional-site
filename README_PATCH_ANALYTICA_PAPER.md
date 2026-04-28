# Patch - Paper Analytica for Intelligence and Security Studies

Questa patch aggiunge tre paper pubblicati su Analytica for Intelligence and Security Studies, oggi non più online, con download locale dei PDF nelle singole schede.

Paper aggiunti:
- L’analisi previsionale in epoca di COVID-19
- Analisi delle ipotesi in competizione (ACH) — Case study Venezuela crisis
- Intelligence e servizi — Il sistema informativo nazionale

File principali:
- src/content/pubblicazioni/analytica-analisi-previsionale-covid-19.md
- src/content/pubblicazioni/analytica-ach-venezuela-crisis.md
- src/content/pubblicazioni/analytica-intelligence-servizi-sistema-informativo-nazionale.md
- public/docs/pubblicazioni/analytica/
- public/images/publications/analytica/
- src/pages/pubblicazioni/index.astro
- src/pages/pubblicazioni/[slug].astro

Dopo l'applicazione:

npm run build
git add .
git commit -m "Add Analytica papers with PDF downloads"
git push
