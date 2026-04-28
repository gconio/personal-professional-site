# Patch — Pubblicazioni Alpha Institute

Questa patch modifica la sezione Pubblicazioni in due punti:

1. nella pagina principale `/pubblicazioni/` elimina il pulsante `Scarica PDF` dalle card;
2. per i paper Alpha Institute esplicita che il sito dell’editore non è più online e che il PDF è disponibile nella scheda individuale.

Il download resta disponibile nelle pagine individuali dei singoli paper.

## Applicazione

Copia la cartella `src` nella root del progetto, sovrascrivendo i file esistenti.

Poi esegui:

```powershell
npm run build
git add .
git commit -m "Adjust Alpha publications display"
git push
```
