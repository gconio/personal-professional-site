# Patch — Nuova intervista OSINT

## Contenuto aggiunto

Aggiunge una nuova scheda nella collection media/interviste:

- `src/content/media/intervista-osint-mirko-lapi-wgo.md`

## Video

- YouTube ID: `BywVRlzuo9M`
- URL: `https://www.youtube.com/watch?v=BywVRlzuo9M`
- Titolo: `OSINT: l’intelligence delle fonti aperte tra metodo e responsabilità`

## Nota su Home

Il contenuto è impostato con:

```yaml
featured: true
order: 0
```

In questo modo dovrebbe comparire come intervista più recente nella Home, se la Home ordina i contenuti media/interviste per `order` o per evidenza.

## Dopo la copia

Eseguire:

```powershell
cd C:\Users\giova\OneDrive\Desktop\Installazioni\personal-professional-site-starter
npm run build
npm run dev
```

Verificare:

- `http://localhost:4321/interviste/`
- `http://localhost:4321/`
