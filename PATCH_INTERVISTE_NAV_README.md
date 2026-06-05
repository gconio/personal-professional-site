# Patch navigazione — Interviste

Questa patch aggiunge la voce `Interviste` alla navigazione principale e ai link del footer.

## File inclusi

- `src/components/Header.astro`
- `src/components/Footer.astro`

## Applicazione

Copiare i file nella root del progetto `personal-professional-site-starter`, sovrascrivendo quelli esistenti.

## Verifica

```powershell
cd C:\Users\giova\OneDrive\Desktop\Installazioni\personal-professional-site-starter
npm run build
npm run dev
```

Poi controllare:

- `http://localhost:4321/`
- `http://localhost:4321/interviste/`

La voce `Interviste` deve comparire sia nel menu principale sia nel footer.
