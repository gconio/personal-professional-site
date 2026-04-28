# Patch commenti Manuale

Questa patch aggiunge una pagina moderata per ricevere commenti sul volume **Manuale per l’analisi intelligence**.

## File inclusi

- `src/pages/commenti-manuale.astro`
- `src/pages/commento-inviato.astro`
- `src/pages/pubblicazioni/[slug].astro`

## Funzionamento

Il form invia i messaggi a:

`giovanni.conio@proton.me`

tramite FormSubmit.

Alla prima submission FormSubmit invierà una email di conferma all’indirizzo di destinazione. Dopo la conferma, le submission successive arriveranno direttamente via email.

## Applicazione

Copia la cartella `src` nella root del progetto, sovrascrivendo i file esistenti.

Poi esegui:

```powershell
npm run build
git add .
git commit -m "Add moderated reader comments for Manuale"
git push
```
