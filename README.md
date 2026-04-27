# Personal Professional Site — Astro + Cloudflare Pages

Starter kit per un sito personale professionale dedicato a didattica, pubblicazioni, progetti e analisi.

## Stack

- Astro
- Markdown
- GitHub
- Cloudflare Pages

## Comandi locali

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Struttura contenuti

- `src/content/corsi/` — schede didattiche
- `src/content/progetti/` — schede progetto
- `src/content/pubblicazioni/` — pubblicazioni e materiali
- `src/content/analisi/` — articoli e note analitiche

## Pagine principali

- `/`
- `/chi-sono/`
- `/didattica/`
- `/progetti/`
- `/pubblicazioni/`
- `/analisi/`
- `/contatti/`

## Deploy Cloudflare Pages

Configurazione consigliata:

- Framework preset: Astro
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
