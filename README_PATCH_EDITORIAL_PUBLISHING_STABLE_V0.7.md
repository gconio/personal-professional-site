# Lab4Int Editorial Publishing Stable v0.7

## Obiettivo

Rendere la pubblicazione degli articoli Lab4Int ripetibile e conforme alle schede già consolidate.

## Interventi

- normalizzazione della scheda `dall-evento-all-indicatore.md`;
- profilo obbligatorio per gli articoli online Lab4Int;
- controllo bloccante di metadata, PDF, thumbnail, tag e sezioni;
- template canonico;
- generatore di nuove schede;
- integrazione del controllo in `npm run editorial:check`;
- nessuna nuova dipendenza.

## Nuova scheda

```powershell
npm run editorial:new-publication -- `
  --title "Titolo dell'articolo" `
  --description "Descrizione sintetica dell'articolo tra 100 e 180 caratteri" `
  --theme "Tema principale" `
  --tags "intelligence analysis,metodologia intelligence,SATs,warning,Lab4Int"
```

## Verifica

```powershell
npm run editorial:publication-check
npm run editorial:check
```

La pubblicazione resta soggetta ad approvazione esplicita e non viene eseguita automaticamente.