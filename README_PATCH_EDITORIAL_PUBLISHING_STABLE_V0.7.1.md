# Lab4Int Editorial Publishing Stable v0.7.1

## Correzione

La verifica bloccante controlla esclusivamente:

- le schede nuove o modificate nella working tree;
- oppure una scheda indicata esplicitamente con `--article`.

Le non conformità delle pubblicazioni storiche sono rilevate dal comando di audit, ma non bloccano la pubblicazione corrente.

## Comandi

Controllo delle sole schede nuove o modificate:

```powershell
npm run editorial:publication-check
```

Controllo esplicito di una singola scheda:

```powershell
node scripts/editorial/check-publication-profile.mjs --article dall-evento-all-indicatore
```

Audit completo non bloccante:

```powershell
npm run editorial:publication-audit
```

Ciclo editoriale:

```powershell
npm run editorial:check
```

## Principio operativo

Lo standard viene applicato rigidamente ai nuovi contenuti. Le schede storiche possono essere normalizzate progressivamente, senza interrompere la pubblicazione.