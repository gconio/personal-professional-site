# Patch immagine corso Simulazioni intelligence e crisis management

Questa patch inserisce l'immagine della piattaforma Intel Sim nella scheda corso `Simulazioni intelligence e crisis management`.

## Applicazione consigliata

Dalla root del progetto:

```powershell
.\APPLICA_PATCH_IMMAGINE_SIMULAZIONI.ps1
npm run build
git add .
git commit -m "Add image to simulations course page"
git push
```

Lo script:

1. copia l'immagine in `public/images/courses/`;
2. inserisce il blocco immagine nella scheda `src/content/corsi/simulazioni-intelligence.md`;
3. aggiunge gli stili CSS necessari in `src/styles/global.css` senza sovrascrivere l'intero file.

Se la scheda corso non esiste, lo script la crea con contenuto base.
