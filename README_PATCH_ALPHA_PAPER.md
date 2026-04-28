Patch: pubblicazioni Alpha Institute con download locale.

Questa patch aggiunge alla sezione Pubblicazioni cinque paper pubblicati originariamente su The Alpha Institute of Geopolitics and Intelligence, oggi non più online, rendendoli disponibili in download PDF.

File principali aggiornati:
- src/content.config.ts
- src/pages/pubblicazioni/index.astro
- src/pages/pubblicazioni/[slug].astro

Nuovi contenuti:
- src/content/pubblicazioni/alpha-sistema-informativo-nazionale.md
- src/content/pubblicazioni/alpha-intelligence-vi-raccontiamo-che-cose.md
- src/content/pubblicazioni/alpha-indicator-based-analysis.md
- src/content/pubblicazioni/alpha-ach-analisi-ipotesi-concorrenti.md
- src/content/pubblicazioni/alpha-teorema-bayes-analisi-intelligence.md

Nuovi PDF:
- public/docs/pubblicazioni/alpha/*.pdf

Nuove immagini di copertina:
- public/images/publications/alpha/*.png

Come applicare:
1. Estrarre lo ZIP.
2. Copiare le cartelle src/ e public/ nella root del progetto, sovrascrivendo i file esistenti.
3. Eseguire:
   npm run build
   git add .
   git commit -m "Add Alpha Institute papers with PDF downloads"
   git push
