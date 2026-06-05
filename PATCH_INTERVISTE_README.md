# Patch Interviste + intervista recente in Home

Questa patch rinomina la sezione in **Interviste**, mantiene la collection `media` come archivio tecnico dei contenuti e pubblica la pagina principale su:

`/interviste/`

La descrizione della pagina diventa:

> Una raccolta di interviste, dialoghi, registrazioni audio e materiali pubblici direttamente collegati ad analisi intelligence e formazione.

## File inclusi

- `src/content.config.ts`
- `src/pages/interviste/index.astro`
- `src/pages/media/index.astro` redirect 301 verso `/interviste/`
- `src/pages/multimedia/index.astro` redirect 301 verso `/interviste/`
- `src/pages/index.astro`
- `src/content/media/dialogo-irene-piccolo.md`
- `src/content/media/intervista-youtube-intelligence-analysis.md`
- `src/styles/global.css`
- `public/images/media/formazione-analisti-dialogo-irene-piccolo-cover.png`

## Effetto in Home

La Home mostra a fondo pagina, prima del blocco Contatti, la sezione:

`Intervista più recente`

con embed YouTube dell’ultimo contenuto della collection `media` marcato come intervista.

## Verifica

Dopo aver copiato i file dalla root del progetto:

```powershell
cd C:\Users\giova\OneDrive\Desktop\Installazioni\personal-professional-site-starter
npm run build
npm run dev
```

Aprire:

`http://localhost:4321/interviste/`

E verificare anche la Home:

`http://localhost:4321/`

## Nota menu

Per inserire la voce **Interviste** nel menu principale serve modificare:

`src/components/Header.astro`

Se non è incluso in questa patch, caricalo e si prepara una micro-patch dedicata.
