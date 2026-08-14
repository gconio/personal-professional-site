# Patch popup Masterclass settembre 2026

## File inclusi

- `src/components/MasterclassPopup.astro`
- `src/layouts/BaseLayout.astro`
- `public/images/masterclass/masterclass-pensare-per-scenari-2026.png`

## Funzione

Aggiunge un popup discreto in basso a destra per promuovere la Masterclass “Pensare per scenari”.

Il pulsante `Iscriviti` punta a:

`https://forms.gle/Ku4o7kFFtJsC1JdF9`

Il popup:

- appare una sola volta per sessione;
- può essere chiuso con il pulsante `×`;
- può essere chiuso con `Esc`;
- usa l’immagine della locandina fornita;
- non modifica il contenuto delle pagine.

## Test

```powershell
cd C:\Users\giova\OneDrive\Desktop\Installazioni\personal-professional-site-starter
npm run build
npm run dev
```

Aprire:

`http://localhost:4321/`

Per rivedere il popup nella stessa sessione browser, aprire DevTools > Application > Session Storage e cancellare la chiave:

`lab4intMasterclassPopupClosed`
