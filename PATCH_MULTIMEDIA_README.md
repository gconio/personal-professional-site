# Patch Multimedia + miniature sorgenti

Questa patch rinomina la sezione in **Multimedia** e aggiunge il supporto alle miniature per contenuti non YouTube.

## File inclusi

- `src/content.config.ts`
- `src/pages/multimedia/index.astro`
- `src/pages/media/index.astro` redirect 301 verso `/multimedia/`
- `src/content/media/dialogo-irene-piccolo.md`
- `src/content/media/intervista-youtube-intelligence-analysis.md`
- `src/styles/global.css`
- `public/images/media/formazione-analisti-dialogo-irene-piccolo-cover.png`

## Note operative

La pagina principale diventa:

`/multimedia/`

La vecchia pagina:

`/media/`

rimane come redirect, così eventuali link già inseriti non si rompono.

## Controllo

Dopo aver copiato i file:

```powershell
cd C:\Users\giova\OneDrive\Desktop\Installazioni\personal-professional-site-starter
npm run build
npm run dev
```

Aprire:

`http://localhost:4321/multimedia/`
