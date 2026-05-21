# CTA patch — Lab4Int

Intervento: aggiunta di call to action contestuali nelle pagine principali.

File modificati:
- `src/pages/didattica/[slug].astro`
- `src/pages/pubblicazioni/[slug].astro`
- `src/pages/progetti/[slug].astro`
- `src/pages/pubblicazioni/index.astro`
- `src/pages/progetti/index.astro`
- `src/pages/risorse/index.astro`
- `src/pages/contatti.astro`

Nota:
- Il file caricato come `src_pages_didattica_index.astro` contiene la stessa struttura di `src/pages/progetti/index.astro`; per evitare sovrascritture errate non è stato incluso nella patch.
- Le CTA usano classi già presenti nel sito (`panel`, `button primary`, `button secondary`, `page-section`, `compact-section`) e CSS locale nei singoli file.
- Il testo della CTA nelle pagine dinamiche cambia in base allo slug del corso/progetto/pubblicazione, con trattamento specifico per `simulazioni-intelligence`, `intel-sim-platform` e `manuale-analisi-intelligence`.

Verifica:
```powershell
npm run build
git status --short
```
