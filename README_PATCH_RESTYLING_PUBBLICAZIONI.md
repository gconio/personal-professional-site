Patch di restyling della pagina Pubblicazioni.

File aggiornato:
- src/pages/pubblicazioni/index.astro

La patch non modifica global.css: gli stili sono contenuti nella pagina Astro, così si riduce il rischio di regressioni su altre sezioni del sito.

Come applicare:
1. Copiare la cartella src/ nella root del progetto, sovrascrivendo il file esistente.
2. Eseguire:
   npm run build
   git add .
   git commit -m "Restyle publications page"
   git push
