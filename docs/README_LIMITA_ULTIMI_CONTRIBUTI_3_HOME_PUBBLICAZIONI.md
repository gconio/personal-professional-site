# Limite “Gli ultimi contributi pubblicati” a 3 card

Questa patch applica la stessa logica sia alla Home sia alla pagina Pubblicazioni:

- `src/pages/index.astro`
- `src/pages/pubblicazioni/index.astro`

Comportamento atteso:

- la sezione `Gli ultimi contributi pubblicati` mostra sempre al massimo 3 card visibili;
- l'ordinamento resta basato sulla data di pubblicazione/visibilità più recente;
- le pubblicazioni programmate restano presenti nell'HTML ma nascoste fino alla data impostata;
- lo script lato browser mostra solo i primi 3 contributi effettivamente visibili.

Comandi consigliati:

```powershell
npm run build
git status --short
git add src/pages/index.astro src/pages/pubblicazioni/index.astro docs/README_LIMITA_ULTIMI_CONTRIBUTI_3_HOME_PUBBLICAZIONI.md
git commit -m "Limit latest contributions to three cards"
git push
```
